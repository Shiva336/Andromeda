import torch
import torch.nn as nn
from torch.nn import init
from torch.autograd import Variable
import pickle
import numpy as np
import time
import random
from collections import defaultdict
from UV_Encoders import UV_Encoder
from UV_Aggregators import UV_Aggregator
from Social_Encoders import Social_Encoder
from Social_Aggregators import Social_Aggregator
import torch.nn.functional as F
import torch.utils.data
from sklearn.metrics import mean_squared_error
from sklearn.metrics import mean_absolute_error
from math import sqrt
import datetime
import argparse
import json
import ast
import os

"""
GraphRec: Graph Neural Networks for Social Recommendation. 
Wenqi Fan, Yao Ma, Qing Li, Yuan He, Eric Zhao, Jiliang Tang, and Dawei Yin. 
In Proceedings of the 28th International Conference on World Wide Web (WWW), 2019. Preprint[https://arxiv.org/abs/1902.07243]

If you use this code, please cite our paper:
```
@inproceedings{fan2019graph,
  title={Graph Neural Networks for Social Recommendation},
  author={Fan, Wenqi and Ma, Yao and Li, Qing and He, Yuan and Zhao, Eric and Tang, Jiliang and Yin, Dawei},
  booktitle={WWW},
  year={2019}
}
```

"""


class GraphRec(nn.Module):

    def __init__(self, enc_u, enc_v_history, r2e, hidden_dim):
        super(GraphRec, self).__init__()
        self.enc_u = enc_u
        self.enc_v_history = enc_v_history
        self.embed_dim = enc_u.embed_dim

        self.w_ur1 = nn.Linear(self.embed_dim, self.embed_dim)
        self.w_ur2 = nn.Linear(self.embed_dim, self.embed_dim)
        self.w_vr1 = nn.Linear(self.embed_dim, self.embed_dim)
        self.w_vr2 = nn.Linear(self.embed_dim, self.embed_dim)
        self.w_uv1 = nn.Linear(self.embed_dim * 2, self.embed_dim)
        self.w_uv2 = nn.Linear(self.embed_dim, 16)
        self.w_uv3 = nn.Linear(16, 1)
        self.r2e = r2e
        self.bn1 = nn.BatchNorm1d(self.embed_dim, momentum=0.5)
        self.bn2 = nn.BatchNorm1d(self.embed_dim, momentum=0.5)
        self.bn3 = nn.BatchNorm1d(self.embed_dim, momentum=0.5)
        self.bn4 = nn.BatchNorm1d(16, momentum=0.5)
        self.criterion = nn.MSELoss()
        self.mlp = nn.Sequential(
            nn.Linear(self.embed_dim*2, hidden_dim),  # Input size: self.embed_dim, Output size: hidden_dim
            nn.ReLU(),
            nn.Linear(hidden_dim, self.embed_dim),   # Input size: hidden_dim, Output size: self.embed_dim
            nn.ReLU()
        )

    def forward(self, nodes_u, nodes_v):
        embeds_u = self.enc_u(nodes_u)
        embeds_v = self.enc_v_history(nodes_v)

        x_u = F.relu(self.bn1(self.w_ur1(embeds_u)))
        x_u = F.dropout(x_u, training=self.training)
        x_u = self.w_ur2(x_u)
        x_v = F.relu(self.bn2(self.w_vr1(embeds_v)))
        x_v = F.dropout(x_v, training=self.training)
        x_v = self.w_vr2(x_v)

        x_uv = torch.cat((x_u, x_v), 1)
        x = F.relu(self.bn3(self.w_uv1(x_uv)))
        x = F.dropout(x, training=self.training)
        x_uv = self.mlp(x_uv)  # Apply the MLP to normalize the data
        x = F.relu(self.bn4(self.w_uv2(x)))
        x = F.dropout(x, training=self.training)
        scores = self.w_uv3(x)
        return scores.squeeze()

    def loss(self, nodes_u, nodes_v, labels_list):
        scores = self.forward(nodes_u, nodes_v)
        return self.criterion(scores, labels_list)


def train(model, device, train_loader, optimizer, epoch, best_rmse, best_mae):
    model.train()
    running_loss = 0.0
    for i, data in enumerate(train_loader, 0):
        batch_nodes_u, batch_nodes_v, labels_list = data
        optimizer.zero_grad()
        loss = model.loss(batch_nodes_u.to(device), batch_nodes_v.to(device), labels_list.to(device))
        loss.backward(retain_graph=True)
        optimizer.step()
        running_loss += loss.item()
        if i % 100 == 0:
            print('[%d, %5d] loss: %.3f, The best rmse/mae: %.6f / %.6f' % (
                epoch, i, running_loss / 100, best_rmse, best_mae))
            running_loss = 0.0
    return 0


def test(model, device, test_loader):
    model.eval()
    tmp_pred = []
    target = []
    with torch.no_grad():
        for test_u, test_v, tmp_target in test_loader:
            test_u, test_v, tmp_target = test_u.to(device), test_v.to(device), tmp_target.to(device)
            val_output = model.forward(test_u, test_v)
            tmp_pred.append(val_output.data.squeeze().tolist())
            target.append(list(tmp_target.data.cpu().numpy()))
    tmp_pred = np.array(sum(tmp_pred, []))
    target = np.array(sum(target, []))
    sorted_indices = sorted(enumerate(tmp_pred), key=lambda item: item[1], reverse=True)
    # Extract the sorted indices from the sorted (index, value) pairs.
    sorted_indices = [index + 1 for index, _ in sorted_indices]
    print(sorted_indices[:3])
    expected_rmse = sqrt(mean_squared_error(tmp_pred, target))
    mae = mean_absolute_error(tmp_pred, target)
    return expected_rmse, mae


def main():
    # Training settings
    parser = argparse.ArgumentParser(description='Social Recommendation: GraphRec model')
    parser.add_argument('--batch_size', type=int, default=128, metavar='N', help='input batch size for training')
    parser.add_argument('--embed_dim', type=int, default=256, metavar='N', help='embedding size')
    parser.add_argument('--lr', type=float, default=0.001, metavar='LR', help='learning rate')
    parser.add_argument('--test_batch_size', type=int, default=1000, metavar='N', help='input batch size for testing')
    parser.add_argument('--epochs', type=int, default=100, metavar='N', help='number of epochs to train')
    args = parser.parse_args()

    os.environ['CUDA_VISIBLE_DEVICES'] = '0'
    use_cuda = False
    if torch.cuda.is_available():
        use_cuda = True
    device = torch.device("cuda" if use_cuda else "cpu")

    embed_dim = args.embed_dim

    path_data = '../graphrec/data/'
    train_uf = open(path_data+'train_user_array.json', 'rb')
    train_vf = open(path_data+'train_item_array.json', 'rb')
    train_rf = open(path_data+'train_rating_array.json', 'rb')
    test_uf = open(path_data+'test_user_array.json', 'rb')
    test_vf = open(path_data+'test_item_array.json', 'rb')
    test_rf = open(path_data+'test_rating_array.json', 'rb')
    history_u_listsf = open(path_data+'user_item_interactions.json', 'rb')
    history_ur_listsf = open(path_data+'user_item_ratings.json', 'rb')
    history_v_listsf = open(path_data+'item_user_interactions.json', 'rb')
    history_vr_listsf = open(path_data+'item_user_ratings.json', 'rb')
    social_adj_listsf = open(path_data+'social_adj_lists.json', 'rb')
    ratings_listf = open(path_data+'ratings_list.json', 'rb')

    
    train_u = json.load(train_uf)
    train_v = json.load(train_vf)
    train_r = json.load(train_rf)
    test_u = json.load(test_uf)
    test_v = json.load(test_vf)
    test_r = json.load(test_rf)
    history_u_listst =  json.load(history_u_listsf)
    history_ur_listst = json.load(history_ur_listsf)
    history_v_listst =  json.load(history_v_listsf)
    history_vr_listst = json.load(history_vr_listsf)
    social_adj_listst = json.load(social_adj_listsf)
    ratings_listt = json.load(ratings_listf)

    history_u_lists = {int(key): value for key, value in history_u_listst.items()}
    history_ur_lists = {int(key): value for key, value in history_ur_listst.items()}
    history_v_lists = {int(key): value for key, value in history_v_listst.items()}
    history_vr_lists = {int(key): value for key, value in history_vr_listst.items()}
    social_adj_lists = {int(key): value for key, value in social_adj_listst.items()}
    ratings_list = {float(key): value for key, value in ratings_listt.items()}
 






    # dir_data = './data/toy_dataset'

    # path_data = dir_data + ".pickle"
    # data_file = open(path_data, 'rb')
    # history_u_lists, history_ur_lists, history_v_lists, history_vr_lists, train_u, train_v, train_r, test_u, test_v, test_r, social_adj_lists, ratings_list = pickle.load(
    #     data_file)
    # print(type(train_u))
    """
    ## toy dataset 
    history_u_lists, history_ur_lists:  user's purchased history (item set in training set), and his/her rating score (dict)
    history_v_lists, history_vr_lists:  user set (in training set) who have interacted with the item, and rating score (dict)
    
    train_u, train_v, train_r: training_set (user, item, rating)
    test_u, test_v, test_r: testing set (user, item, rating)
    
    # please add the validation set
    
    social_adj_lists: user's connected neighborhoods
    ratings_list: rating value from 0.5 to 4.0 (8 opinion embeddings)
    """

    # trainset = torch.utils.data.TensorDataset(torch.LongTensor(train_u), torch.LongTensor(train_v),torch.FloatTensor(train_r))
    testset = torch.utils.data.TensorDataset(torch.LongTensor(test_u), torch.LongTensor(test_v),torch.FloatTensor(test_r))
    # train_loader = torch.utils.data.DataLoader(trainset, batch_size=args.batch_size, shuffle=True)
    test_loader = torch.utils.data.DataLoader(testset, batch_size=args.test_batch_size, shuffle=True)
    num_users = history_u_lists.__len__()
    num_items = history_v_lists.__len__()
    num_ratings = ratings_list.__len__()

    u2e = nn.Embedding(num_users+1, embed_dim).to(device)
    v2e = nn.Embedding(num_items+1, embed_dim).to(device)
    r2e = nn.Embedding(num_ratings, embed_dim).to(device)

    # user feature
    # features: item * rating
    agg_u_history = UV_Aggregator(v2e, r2e, u2e, embed_dim, cuda=device, uv=True)
    enc_u_history = UV_Encoder(u2e, embed_dim, history_u_lists, history_ur_lists, agg_u_history, cuda=device, uv=True)
    # neighobrs
    agg_u_social = Social_Aggregator(lambda nodes: enc_u_history(nodes).t(), u2e, embed_dim, cuda=device)
    enc_u = Social_Encoder(lambda nodes: enc_u_history(nodes).t(), embed_dim, social_adj_lists, agg_u_social,
                           base_model=enc_u_history, cuda=device)

    # item feature: user * rating
    agg_v_history = UV_Aggregator(v2e, r2e, u2e, embed_dim, cuda=device, uv=False)
    enc_v_history = UV_Encoder(v2e, embed_dim, history_v_lists, history_vr_lists, agg_v_history, cuda=device, uv=False)

    # model
    hidden_dim = 256
    graphrec = GraphRec(enc_u, enc_v_history, r2e, hidden_dim).to(device)
    optimizer = torch.optim.RMSprop(graphrec.parameters(), lr=args.lr, alpha=0.9)
    file_path = '../graphrec/data/model_parameters1.pth'
    device = torch.device('cpu')
    if os.path.exists(file_path):
        graphrec.load_state_dict(torch.load(file_path, map_location=device))
        graphrec.eval()

    best_rmse = 9999.0
    best_mae = 9999.0
    endure_count = 0
    expected_rmse, mae = test(graphrec, device, test_loader)


    # for epoch in range(1, args.epochs + 1):

    #     # train(graphrec, device, train_loader, optimizer, epoch, best_rmse, best_mae)
    #     expected_rmse, mae = test(graphrec, device, test_loader)
    #     # please add the validation set to tune the hyper-parameters based on your datasets.

    #     # early stopping (no validation set in toy dataset)
    #     if best_rmse > expected_rmse:
    #         best_rmse = expected_rmse
    #         best_mae = mae
    #         endure_count = 0
    #     else:
    #         endure_count += 1
    #     print("rmse: %.4f, mae:%.4f " % (expected_rmse, mae))

    #     if best_rmse < 0.4:
    #         file_path = 'model_parameters.pth'
    #         torch.save(graphrec.state_dict(), file_path)
    #         break
            

    #     if endure_count > 5:
    #         break


if __name__ == "__main__":
    main()
