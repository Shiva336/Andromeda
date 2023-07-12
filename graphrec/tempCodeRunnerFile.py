   file_path = './data/model_parameters1.pth'
    device = torch.device('cpu')
    if os.path.exists(file_path):
        graphrec.load_state_dict(torch.load(file_path, map_location=device))
        print("Loaded model parameters from:", file_path)
