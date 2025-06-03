# 📚 도서 기반 음악 생성 (프로토타입)

프로토타입은 사용자가 입력한 책의 정보(제목, 저자)를 바탕으로 해당 책의 설명이나 인상 깊은 구절에 어울리는 배경음악을 생성합니다. 생성된 음악은 버전별로 누적되어 관리되며, 각 음악 생성에 사용된 AI 프롬프트도 함께 확인할 수 있습니다.

## ✨ 주요 기능

*   **도서 정보 연동**: Google Books API를 통해 입력된 책의 설명을 자동으로 가져옵니다.
*   **AI 기반 프롬프트 생성/업데이트**:
    *   초기 음악(v0)은 책 설명을 기반으로 OpenAI의 GPT-4o-mini (Replicate API 경유)가 음악 생성용 프롬프트를 만듭니다.
    *   이후 버전(v1, v2...)은 사용자가 입력한 '인상 깊은 구절'과 '이전에 AI가 생성한 음악 프롬프트'를 종합적으로 고려하여, GPT-4o-mini가 창의적으로 재구성한 새로운 프롬프트를 생성합니다.
*   **AI 음악 생성**: 생성된 프롬프트를 기반으로 Meta의 MusicGen 모델 (Replicate API 경유)이 기악 배경음악을 생성합니다.
*   **버전별 음악 히스토리**: 생성된 모든 음악 버전(v0, v1, v2...)과 각 버전에 사용된 AI 생성 프롬프트, 기반 텍스트(책 설명 또는 추가 구절)가 애플리케이션 내에 누적되어 표시됩니다.
*   **사용자 친화적 인터페이스**: Streamlit을 사용하여 웹 애플리케이션 형태로 제공되며, 사용자가 쉽게 음악 길이를 조절하는 등의 상호작용을 할 수 있습니다.

## 🛠️ 사용 기술

*   **프로그래밍 언어**: Python
*   **웹 프레임워크**: Streamlit
*   **API 및 라이브러리**:
    *   `requests`: Google Books API 호출
    *   `replicate`: 머신러닝 모델 실행 플랫폼
        *   **LLM (프롬프트 생성)**: `openai/gpt-4o-mini`
        *   **음악 생성**: `meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb`
    *   Google Books API: 도서 정보 검색

## ⚙️ 설치 및 환경 설정

1.  **Python 설치**: Python 3.7 이상 버전을 설치합니다.
2.  **가상 환경 생성 (권장)**:
    ```
    python -m venv venv
    source venv/bin/activate  # Linux/macOS
    # venv\Scripts\activate    # Windows
    ```
3.  **필수 라이브러리 설치**:
    ```
    pip install streamlit requests replicate
    ```
4.  **Replicate API 토큰 설정**:
    이 애플리케이션을 사용하려면 Replicate API 토큰이 필요합니다. 발급받은 토큰을 환경 변수로 설정해주세요.
    *   Linux/macOS:
        ```
        export REPLICATE_API_TOKEN="여러분의_Replicate_API_토큰"
        ```
    *   Windows (Command Prompt):
        ```
        set REPLICATE_API_TOKEN="여러분의_Replicate_API_토큰"
        ```
    *   Windows (PowerShell):
        ```
        $env:REPLICATE_API_TOKEN="여러분의_Replicate_API_토큰"
        ```
    Streamlit Cloud에 배포하는 경우, 해당 플랫폼의 'Secrets' 설정에 `REPLICATE_API_TOKEN`을 추가해야 합니다.

## 🚀 실행 방법

1.  위 코드를 `app.py`와 같이 파이썬 파일로 저장합니다.
2.  터미널을 열고 `app.py` 파일이 있는 디렉토리로 이동합니다.
3.  다음 명령어를 실행하여 Streamlit 애플리케이션을 실행합니다:
    ```
    streamlit run app.py
    ```
    웹 브라우저에서 애플리케이션이 자동으로 열립니다.

## 📖 사용 가이드

애플리케이션이 실행되면 다음 단계에 따라 음악을 생성할 수 있습니다:

1.  **Step 1: 책 정보로 첫 번째 음악(v0) 만들기**
    *   '책 제목을 입력하세요' 필드에 원하는 책의 제목을 입력합니다.
    *   '저자 이름을 입력하세요' 필드에 해당 책의 저자 이름을 입력합니다.
    *   'v0 음악 생성하기' 버튼을 클릭합니다.
    *   잠시 후, 책 설명을 기반으로 생성된 첫 번째 음악(v0)과 해당 음악 생성에 사용된 AI 프롬프트가 화면에 표시됩니다.

2.  **Step 2: 인상 깊은 구절로 다음 음악(vN) 만들기**
    *   v0 음악이 성공적으로 생성되면, 그 아래에 'Step 2' 섹션이 나타납니다.
    *   '음악에 새롭게 반영하고 싶은 인상 깊은 구절이나 아이디어를 입력하세요:' 텍스트 영역에 책의 특정 구절이나 음악에 담고 싶은 새로운 느낌/아이디어를 입력합니다.
    *   '생성할 음악 길이 (초)' 슬라이더를 조절하여 원하는 음악 길이를 설정합니다 (기본 15초).
    *   'vN 음악 생성하기' (예: 'v1 음악 생성하기') 버튼을 클릭합니다.
    *   AI는 이전에 자신이 만들었던 음악 프롬프트와 사용자가 새로 입력한 구절을 종합적으로 고려하여, 창의적으로 재구성한 새 프롬프트를 만들고 이를 기반으로 다음 버전의 음악을 생성합니다.
    *   생성된 모든 버전의 음악과 관련 정보는 '생성된 음악 히스토리' 섹션에 누적되어 표시되며, 각 버전을 펼쳐서 프롬프트 확인 및 음악 감상을 할 수 있습니다.

## ⚠️ 주의사항 및 문제 해결

*   **API 응답 시간**: AI 모델(GPT-4o-mini, MusicGen)을 호출하는 과정에서 다소 시간이 소요될 수 있습니다 (특히 음악 생성 시 1~2분 이상). 작업 중에는 스피너(spinner)가 표시되니 잠시 기다려주세요.
*   **`st.experimental_rerun()`**: 이 코드는 UI 업데이트를 위해 `st.experimental_rerun()`을 사용합니다. 만약 `AttributeError: module 'streamlit' has no attribute 'experimental_rerun'` (또는 유사한 `rerun` 관련) 오류가 발생하면, 현재 사용 중인 Streamlit 라이브러리 버전이 해당 함수를 지원하지 않는 것일 수 있습니다. 이 경우 다음을 시도해 보세요:
    1.  Streamlit을 최신 버전으로 업그레이드: `pip install --upgrade streamlit`
    2.  최신 버전의 Streamlit에서는 `st.rerun()`이 표준 함수일 수 있습니다. 코드 내 `st.experimental_rerun()`을 `st.rerun()`으로 변경해보세요. (단, 사용 중인 Streamlit 버전에 따라 적절한 API가 다를 수 있으니 Streamlit 공식 문서를 확인하는 것이 좋습니다.)
*   **API 키 유효성**: `REPLICATE_API_TOKEN`이 정확하게 설정되었는지, 그리고 해당 토큰이 유효한지 확인해주세요. API 호출 실패 시 관련 오류 메시지가 표시될 수 있습니다.

---
