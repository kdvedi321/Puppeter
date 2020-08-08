let puppeteer = require("puppeteer");
let cFile = process.argv[2];
let fs = require("fs");
let pUrl = process.argv[3];
let nPost = process.argv[4];
(async function(){
    // browser create => incognito mode, full screen
    try{
        // browser create => incognito mode, fullscreen
        let data = await fs.promises.readFile(cFile);
        let {url, pwd, user} = JSON.parse(data);
        // launch browser
        let browser = await puppeteer.launch({
            headless: false,
            defaultViewport: null,
            args: ["--start-maximized","--disable-notifications"]
        });
        // let tab1 = await browser.newPage();
        let tabs = await browser.pages();
        let tab = tabs[0];
        // dom => html
        // browser => 500ms request
        // hk login page
        await tab.goto(url, {waitUntil: "networkidle2"});
        await tab.waitForSelector("input[type=email]");
        await tab.type("input[type=email]",user,{delay:120});
        await tab.type("input[type=password]",pwd,{delay:120});
        await Promise.all([
            tab.click(".login_form_login_button"),tab.waitForNavigation({
                waitUntil:"networkidle2"
            })
        ])
        await tab.goto(pUrl, {waitUntil:"networkidle2"});
        await tab.waitForSelector("div[data-key=tab_posts]");
        await Promise.all([
            tab.click("div[data-key=tab_posts]"),
            tab.waitForNavigation({waitUntil:"networkidle2"})
        ])
        await tab.waitForNavigation({waitUntil:"networkidle2"});
        let idx=0;
        do{
            // post => 7 post => are loaded
            await tab.waitForSelector("#pagelet_timeline_main_column ._1xnd .clearfix.uiMorePager");
            // immediate child => 1xnd(group post) => post

            let elements = await tab.$$("#pagelet_timeline_main_column ._1xnd > ._4-u2._4-u8");
            // await tab.waitForSelector("#pagelet_timeline_main_column ._1xnd .clearfix.uiMorePager");
            // console.log(elements.length);
            let post = elements[idx];
            // like => selector
            await tab.waitForSelector("._666k ._8c74");
            await tab.focus("._666k ._8c74");
            // await tab.waitForSelector("._666k");
            let like = await post.$("._666k ._8c74");
            await like.click({delay:100});
            idx++;
            // wait for loader => visible => content load =>
            // hidden => may post => wait for loader
            await tab.waitForSelector(".uiMorePagerLoader", {hidden:true});
            // loader hide wait
            // immediate child
            // descendent
        }while(idx<nPost)
        // await browser.close();
    }catch(err){
        console.log(err);
    }

})();
