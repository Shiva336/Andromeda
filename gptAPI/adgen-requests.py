import asyncio
from pyppeteer import launch

async def send_message():
    browser = await launch()
    page = await browser.newPage()

    # Set the authorization token as a request header
    await page.setExtraHTTPHeaders({'Authorization': 'NzU1Nzk2NDI2ODY4NjU0MTcy.GOBbNS.qhnLd6oi97iPz2h5IxQFkZsw0FoM-eUNlqx0ZM'})

    # Navigate to the Discord channel URL
    await page.goto('https://discord.com/api/v9/channels/1053101349908271114/messages')

    # Wait for the text area selector to be visible
    await page.waitForSelector('textarea.slateTextArea-1Mkdgw')

    # Type the desired message in the text area
    await page.type('textarea.slateTextArea-1Mkdgw', '/imagine')

    # Press the Enter key to send the message
    # await page.keyboard.press('Enter')

    # Wait for the message to be sent (optional)
    await asyncio.sleep(2)  # Adjust the sleep time as needed

    await browser.close()

# Run the send_message function
asyncio.get_event_loop().run_until_complete(send_message())
