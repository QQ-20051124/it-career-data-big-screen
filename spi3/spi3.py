from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup
import csv
import time


class ZhiLianJobCrawler4:
    def __init__(self):
        # 全国范围 + 计算机IT综合岗位（无城市限制）
        self.base_url = "https://www.zhaopin.com/sou/kw2FRN7481778/p1"
        self.all_jobs = []

    def crawl(self):
        print(f"正在打开全国岗位列表页：{self.base_url}")
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=False, slow_mo=300)
            page = browser.new_page(
                user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36 Edg/146.0.0.0",
                viewport={"width": 1920, "height": 1080}
            )

            try:
                page.goto(self.base_url, wait_until="networkidle", timeout=120000)
                print("✅ 页面已打开，请完成【登录】，按回车键继续...")
                input()

                print("✅ 正在切换到「智能匹配」标签页...")
                page.wait_for_selector("//*[contains(text(), '智能匹配')]", timeout=60000)
                page.click("//*[contains(text(), '智能匹配')]", timeout=60000)
                print("✅ 已切换到「智能匹配」标签页")
                page.wait_for_timeout(5000)

                page_num = 1
                while True:
                    print(f"\n📄 正在爬取全国第 {page_num} 页...")

                    last_count = 0
                    for _ in range(5):
                        now = page.locator(".joblist-box__item").count()
                        if now == last_count:
                            break
                        last_count = now
                        page.evaluate("window.scrollTo(0, document.body.scrollHeight)")
                        page.wait_for_timeout(2000)
                    print(f"✅ 第 {page_num} 页加载完成，共 {last_count} 条")

                    html = page.content()
                    soup = BeautifulSoup(html, "html.parser")
                    job_cards = soup.find_all("div", class_="joblist-box__item")

                    for card in job_cards:
                        job_name_tag = card.find("a", target="_blank")
                        job_name = job_name_tag.get_text(strip=True) if job_name_tag else ""

                        salary_tag = card.find("p", class_="jobinfo__salary")
                        salary = salary_tag.get_text(strip=True) if salary_tag else ""

                        info_items = card.find_all("div", class_="jobinfo__other-info-item")
                        city = info_items[0].get_text(strip=True) if len(info_items) > 0 else ""
                        work_year = info_items[1].get_text(strip=True) if len(info_items) > 1 else ""
                        education = info_items[2].get_text(strip=True) if len(info_items) > 2 else ""

                        company_tag = card.find("a", class_="company-name")
                        company_name = company_tag.get_text(strip=True) if company_tag else ""

                        self.all_jobs.append({
                            "岗位名称": job_name,
                            "薪资": salary,
                            "城市": city,
                            "经验要求": work_year,
                            "学历要求": education,
                            "公司名称": company_name,
                            "页码": page_num
                        })

                    print(f"✅ 第 {page_num} 页已保存 → 累计：{len(self.all_jobs)} 条")

                    next_btn = page.locator("a:has-text('下一页')")
                    if not next_btn.is_visible(timeout=3000):
                        print("\n🎉 全国岗位爬取完成，无下一页！")
                        break

                    btn_disabled = next_btn.get_attribute("disabled")
                    if btn_disabled is not None:
                        print("\n🎉 已到达全国岗位最后一页！")
                        break

                    print("✅ 跳转下一页...")
                    next_btn.scroll_into_view_if_needed(timeout=5000)
                    next_btn.click(timeout=10000)
                    page.wait_for_timeout(5000)
                    page_num += 1

            except Exception as e:
                print(f"\n❌ 爬取异常：{str(e)}")

            finally:
                if self.all_jobs:
                    # 独立文件，不和前三批冲突
                    with open("智联2.csv", "w", newline="", encoding="utf-8-sig") as f:
                        writer = csv.DictWriter(f, fieldnames=self.all_jobs[0].keys())
                        writer.writeheader()
                        writer.writerows(self.all_jobs)
                    print(f"\n🎉 第四批全国数据完毕！总计：{len(self.all_jobs)} 条")
                    print("✅ 保存文件：智联2.csv")
                else:
                    print("\n❌ 未抓取到数据，请检查登录状态")
                time.sleep(3)
                browser.close()


if __name__ == "__main__":
    crawler = ZhiLianJobCrawler4()
    crawler.crawl()