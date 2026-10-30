import os, asyncio, http.server, threading, functools, sys, json
from playwright.async_api import async_playwright
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MJ=os.path.join(os.path.dirname(os.path.abspath(__file__)),"node_modules/mathjax-full/es5/tex-svg.js")
class Q(http.server.SimpleHTTPRequestHandler):
    def log_message(self,*a): pass
srv=http.server.ThreadingHTTPServer(("127.0.0.1",0),functools.partial(Q, directory=root)); PORT=srv.server_address[1]; threading.Thread(target=srv.serve_forever,daemon=True).start()
SHOTS=os.path.join(os.path.dirname(os.path.abspath(__file__)),"shots"); os.makedirs(SHOTS,exist_ok=True)
shots=json.loads(sys.argv[1]); dark=len(sys.argv)>2 and sys.argv[2]=="dark"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(); errs=[]
        pg=await b.new_page(viewport={"width":1400,"height":1000}, color_scheme="dark" if dark else "light"); pg.on("pageerror",lambda e: errs.append(str(e)))
        await pg.route("**/mathjax/3.2.2/es5/**", lambda r: r.fulfill(path=MJ.replace("tex-svg.js","")+r.request.url.split("/es5/")[1], content_type="application/javascript"))
        await pg.route("https://fonts.googleapis.com/**", lambda r: r.abort())
        for lid,ci in shots:
            await pg.goto(f"http://127.0.0.1:{PORT}/#{lid}"); await pg.wait_for_timeout(1500)
            await pg.evaluate(f"document.querySelectorAll('#tabs button')[{ci}].click()"); await pg.wait_for_timeout(1200)
            el=await pg.query_selector(".card"); await el.screenshot(path=f"{SHOTS}/{lid.replace('thesis-','')}_card{ci+1}.png")
            merr=await pg.evaluate("document.querySelectorAll('mjx-merror, [data-mjx-error]').length")
            if merr: print("mathjax errors",lid,ci,merr)
        await pg.evaluate("window.scrollTo(0, document.body.scrollHeight)"); await pg.wait_for_timeout(500)
        el=await pg.query_selector(".sheet"); await el.screenshot(path=f"{SHOTS}/{shots[-1][0].replace('thesis-','')}_sheet.png")
        print("errors",errs); await b.close()
asyncio.run(main())
