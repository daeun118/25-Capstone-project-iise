import time
import pandas as pd
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# 크롬드라이버 경로 설정
chrome_path = "./chromedriver-win64/chromedriver.exe"

# 크롬 옵션 설정
options = Options()
options.add_argument('--disable-gpu')
options.add_argument('--window-size=1920,1080')
options.add_argument("user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36")
options.add_experimental_option("excludeSwitches", ["enable-automation"])
options.add_experimental_option("useAutomationExtension", False)

# 드라이버 실행
service = Service(executable_path=chrome_path)
driver = webdriver.Chrome(service=service, options=options)
driver.execute_cdp_cmd("Page.addScriptToEvaluateOnNewDocument", {
    "source": """
    Object.defineProperty(navigator, 'webdriver', {
        get: () => undefined
    });
    """
})

# Amazon Classic 도서 검색 결과 페이지 접속
url = "https://www.amazon.com/s?i=digital-text&srs=18660703011&rh=n%3A18660703011&s=popularity-rank&fs=true&ref=lp_18660703011_sar"
driver.get(url)
time.sleep(3)

# 도서 링크 수집
WebDriverWait(driver, 15).until(
    EC.presence_of_all_elements_located((By.CSS_SELECTOR, "a.a-link-normal.s-no-outline"))
)

book_links = []
while True:
    time.sleep(3)

    books = driver.find_elements(By.CSS_SELECTOR, "a.a-link-normal.s-no-outline")
    for book in books:
        href = book.get_attribute("href")
        if href:
            full_link = "https://www.amazon.com" + href if href.startswith("/") else href
            if full_link not in book_links:
                book_links.append(full_link)

    # 다음 페이지 버튼 클릭
    try:
        next_btn = driver.find_element(By.CSS_SELECTOR, "a.s-pagination-next")
        driver.execute_script("arguments[0].click();", next_btn)
    except:
        print("✅ 모든 도서 페이지 순회 완료!")
        break

print(f"📚 수집된 도서 링크: {len(book_links)}개")

# 하이라이트 수집
results = []

for link in book_links:
    driver.get(link)
    time.sleep(3)

    # 화면 끝까지 스크롤 (하이라이트 영역 로딩 유도)
    driver.execute_script("window.scrollTo(0, document.body.scrollHeight);")
    time.sleep(2)

    # 책 제목 추출
    try:
        title = driver.find_element(By.ID, "productTitle").text.strip()
    except:
        title = "제목 없음"

    # 하이라이트 추출
    try:
        seen_texts = set()
        while True:
            time.sleep(1.5)

            # 하이라이트 span 수집
            spans = driver.find_elements(By.XPATH, "//span[@role='article']")
            for span in spans:
                text = span.text.strip()
                if text and text not in seen_texts and len(text.split()) > 3:
                    seen_texts.add(text)
                    results.append({"책 제목": title, "하이라이트 구절": text})

            # 캐러셀 다음 버튼 클릭 (없으면 종료)
            try:
                next_btn = driver.find_element(By.CSS_SELECTOR, "li.a-carousel-right a")
                if "a-disabled" in next_btn.get_attribute("class"):
                    break
                next_btn.click()
            except:
                break

        if not seen_texts:
            print(f"[!] '{title}' 하이라이트 없음")
    except Exception as e:
        print(f"[!] '{title}' 하이라이트 크롤링 실패: {e}")

# 종료
driver.quit()

# 저장
df = pd.DataFrame(results)
print(df.head())
df.to_csv("amazon_highlights_full.csv", index=False, encoding="utf-8-sig")
print(f"✅ CSV 저장 완료! 총 하이라이트 수: {len(df)}")
