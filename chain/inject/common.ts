export const getFavicon = `
  (function () {
    window.opto = {};
    
    const __getFavicon = function(){
      let favicon = undefined;
      const nodeList = document.getElementsByTagName("link");
      for (let i = 0; i < nodeList.length; i++)
      {
        const rel = nodeList[i].getAttribute("rel")
        if (rel === "icon" || rel === "shortcut icon")
        {
          favicon = nodeList[i]
        }
      }
      return favicon && favicon.href
    }
    window.ReactNativeWebView && window.ReactNativeWebView.postMessage(JSON.stringify(
      {
        type: 'common:getFavicon',
        payload: {
          url: location.href,
          logo: __getFavicon()
        }
      }
    ))
  })();
`
