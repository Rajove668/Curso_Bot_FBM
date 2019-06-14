resp.push({
  image: {
    imageUri: 'https://www.solati.com.co/wp-content/uploads/2018/12/Logo-SOLATI.png',
    accessibilityText: 'solati'
  }
})
    switch (source) {
        case 'facebook':

            break;
        /*case 'WebChatSofia':

            break;
        case 'WhatsApp':

            break;*/
        default:

            break;
    }

    Sofia.quickRepliesDecide(source, resp)
    Sofia.optionMenu(source, req, resp)

    