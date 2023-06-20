# import requests

# payload = {
#     'content':"/imagine advertisement for a middle aged man wearing shoes with a suitable caption 4k, 8k, 16k, full ultra hd, high resolution and cinematic photography --ar 3:2  --v 5 --upbeta --v 5 --Screen Space Reflections --Diffraction Grading --Chromatic Aberration --GB Displacement --Scan Lines --Ambient Occlusion --Anti-Aliasing FKAA --TXAA --RTX --SSAO --OpenGL-Shader’s --Post Processing --Post-Production --Cell Shading --Tone Mapping --CGI --VFX --SFX --insanely detailed and intricate --hyper maximalist --elegant --dynamic pose --photography --volumetric --ultra-detailed --intricate details --super detailed --ambient –uplight"
# }
# header={'Authorization':'NDM2ODc2MTUwMTMyOTY1Mzc3.GjblR4.oMpUNCShw8j3-B_d1LHL2Pw0dhSoG51aOArlEU'}
# r=requests.post("https://discord.com/api/v9/channels/1060989317180301363/messages",data=payload,headers=header)
import requests
from bs4 import BeautifulSoup

# URL of the website
url = "https://discord.com/channels/1046979304547954728/1060989317180301363"  # Replace with the actual website URL

# Send a GET request to the website
response = requests.get(url)

# Parse the HTML content
soup = BeautifulSoup(response.content, "html.parser")

# Find the textbox element
textbox = soup.find("div", {"class": "markup-eYLPri"})  # Replace with the actual class name

# Clear the textbox (optional)
textbox.string = ""

# Type in the desired text
textbox.string = "/imagine"

# Print the modified HTML content
print(soup.prettify())
