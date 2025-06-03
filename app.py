import streamlit as st
import requests
# import time # 현재 직접 사용되지 않음
import replicate
# --- 세션 상태 초기화 ---
if "music_versions" not in st.session_state:
    # 각 음악 버전의 정보 (버전명, LLM 생성 프롬프트, 오디오 URL, 기반 텍스트/구절)를 저장
    st.session_state.music_versions = []
if "current_book_description" not in st.session_state:
    st.session_state.current_book_description = "" # 초기 책 설명 저장용
if "last_llm_generated_prompt" not in st.session_state:
    st.session_state.last_llm_generated_prompt = "" # LLM이 가장 최근에 생성한 음악 프롬프트
# --- API 호출 함수들 ---
def get_book_description_from_api(book_title, book_author):
    """Google Books API를 호출하여 책 설명을 가져옵니다."""
    query = f"{book_title}+inauthor:{book_author}"
    try:
        response = requests.get(f"https://www.googleapis.com/books/v1/volumes?q={query}")
        response.raise_for_status()
        items = response.json().get("items")
        if not items:
            return None, "책 정보를 찾을 수 없습니다. 제목과 저자명을 다시 확인해주세요."
        description = items[0]["volumeInfo"].get("description", "이 책에 대한 설명이 제공되지 않았습니다.")
        return description, None
    except requests.exceptions.RequestException as e:
        return None, f"Google Books API 요청 중 오류 발생: {e}"
    except Exception as e:
        return None, f"책 설명 처리 중 알 수 없는 오류 발생: {e}"
def generate_music_prompt_with_llm(input_text_for_llm, existing_prompt_from_llm=None):
    """
    Replicate LLM (GPT-4o-mini)을 사용하여 음악 생성 프롬프트를 생성하거나 업데이트합니다.
    LLM이 기존 프롬프트와 새로운 구절을 '이해'하고 '새로운' 프롬프트를 만들도록 지시합니다.
    input_text_for_llm: 책 설명 (초기) 또는 사용자가 입력한 인상 깊은 구절 (업데이트 시)
    existing_prompt_from_llm: 업데이트의 기반이 될, 이전에 LLM이 생성했던 음악 프롬프트
    """
    prompt_guidance = ""
    if existing_prompt_from_llm:
        # 프롬프트 업데이트 시 LLM에게 전달할 지시문
        prompt_guidance = (
            f"You are an expert music prompt engineer. Your task is to creatively update an existing music prompt "
            f"based on new input. \n\n"
            f"The PREVIOUS music prompt (created by an AI) was: '{existing_prompt_from_llm}'\n\n"
            f"The NEW user-provided inspiring passage/idea to incorporate is: '{input_text_for_llm}'\n\n"
            f"INSTRUCTIONS: Analyze both the previous prompt and the new passage. "
            f"Generate a COMPLETELY NEW and COHERENT music prompt that thoughtfully integrates the essence of the new passage "
            f"while evolving or building upon the themes of the previous prompt. "
            f"DO NOT simply append the new passage to the old prompt. Instead, RE-IMAGINE and RE-WRITE a fresh prompt. "
            f"The music should remain instrumental, suitable for background listening while reading, typically relaxing, and strictly without vocals or lyrics. "
            f"Focus on translating the combined mood and ideas into actionable musical directions for an AI music generator. "
            f"Output ONLY the new, complete music prompt. No conversational phrases, acknowledgements, or any text other than the music prompt itself."
        )
    else:
        # 초기 프롬프트 생성 시 LLM에게 전달할 지시문
        prompt_guidance = (
            f"You are a music prompt engineer for an AI music generation system. "
            f"Create a detailed and evocative prompt for generating instrumental background music based on the following book description: '{input_text_for_llm}'. "
            f"The music should be designed to be listened to while reading, so it must be relaxing and without vocals or lyrics. "
            f"Focus on conveying the mood, atmosphere, and key themes of the book in your musical directions. "
            f"Just print out the prompts for music creation. No conversational phrases, just the prompt itself."
        )
    try:
        output = replicate.run(
            "openai/gpt-4o-mini",
            input={
                "prompt": prompt_guidance,
                "temperature": 0.75, # 약간의 창의성을 더 부여
                "max_completion_tokens": 350 # 프롬프트 길이를 조금 더 여유있게
            }
        )
        llm_generated_music_prompt = "".join(output) if isinstance(output, list) else str(output)
        return llm_generated_music_prompt.strip(), None
    except replicate.exceptions.ReplicateError as e:
        return None, f"Replicate LLM API 오류: {e}"
    except Exception as e:
        return None, f"음악 프롬프트 생성 중 알 수 없는 오류 발생: {e}"
def generate_music_with_musicgen_api(prompt_for_musicgen, duration=15):
    """Replicate MusicGen을 사용하여 음악을 생성합니다."""
    try:
        output = replicate.run(
            "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
            input={
                "prompt": prompt_for_musicgen,
                "model_version": "large",
                "output_format": "mp3",
                "duration": duration,
                "normalization_strategy": "peak"
            }
        )
        audio_url_generated = str(output)
        return audio_url_generated, None
    except replicate.exceptions.ReplicateError as e:
        return None, f"Replicate MusicGen API 오류: {e}"
    except Exception as e:
        return None, f"음악 생성 중 알 수 없는 오류 발생: {e}"
# --- Streamlit UI ---
st.set_page_config(layout="wide")
st.title("도서 기반 음악 생성기")
# --- 1단계: 책 정보 입력 및 초기 음악 생성 (v0) ---
# v0는 아직 생성된 음악이 없을 때만 입력 폼을 보여줍니다.
if not st.session_state.music_versions:
    st.header("Step 1: 책 정보로 첫 번째 음악(v0) 만들기")
    with st.form("v0_music_form"):
        book_title_v0 = st.text_input("책 제목을 입력하세요", key="book_title_v0")
        book_author_v0 = st.text_input("저자 이름을 입력하세요", key="book_author_v0")
        submitted_v0 = st.form_submit_button("v0 음악 생성하기")
    if submitted_v0 and book_title_v0 and book_author_v0:
        with st.spinner("책 설명 검색 중..."):
            description, error = get_book_description_from_api(book_title_v0, book_author_v0)
            if error:
                st.error(error)
                st.stop()
            st.session_state.current_book_description = description
            st.success("책 설명을 성공적으로 가져왔습니다!")
            st.markdown(f"*기반 책 설명 (요약):* {description[:300]}...")
        with st.spinner("v0 음악 프롬프트 생성 중 (GPT-4o-mini)..."):
            # 초기 프롬프트는 책 설명을 기반으로 생성 (existing_prompt_from_llm=None)
            llm_prompt_v0, error = generate_music_prompt_with_llm(description)
            if error:
                st.error(error)
                st.stop()
            st.session_state.last_llm_generated_prompt = llm_prompt_v0 # 생성된 프롬프트를 저장
            st.success("v0 음악 프롬프트 생성 완료!")
        with st.spinner("v0 음악 생성 중 (MusicGen)... 약 1~2분 소요될 수 있습니다."):
            audio_url_v0, error = generate_music_with_musicgen_api(llm_prompt_v0)
            if error:
                st.error(error)
                st.stop()
            # 생성된 v0 음악 정보를 세션 상태 리스트에 추가
            st.session_state.music_versions.append({
                "version_name": f"v{len(st.session_state.music_versions)} (초기 - 책 설명 기반)",
                "llm_prompt": llm_prompt_v0,
                "audio_url": audio_url_v0,
                "based_on_text": f"책 설명: {description[:100]}..."
            })
            st.success("v0 음악이 성공적으로 생성되었습니다!")
            st.balloons()
            st.experimental_rerun()

 # UI를 다시 그려서 음악 목록과 다음 단계 UI가 보이도록 함
# --- 생성된 음악 목록 표시 ---
if st.session_state.music_versions:
    st.write("---")
    st.header("생성된 음악 히스토리")
    # 오래된 버전부터 순서대로 표시
    for i, music_info in enumerate(st.session_state.music_versions):
        with st.expander(f"*{music_info['version_name']}* - '{music_info['llm_prompt'][:40]}...' 프롬프트 기반", expanded=(i == len(st.session_state.music_versions) - 1)): # 최신 음악만 펼쳐보기
            st.caption(f"생성 기반: {music_info['based_on_text']}")
            st.info(f"LLM 생성 음악 프롬프트:*\n{music_info['llm_prompt']}")
            st.audio(music_info["audio_url"], format="audio/mp3")
            st.write("---")
# --- 2단계: 인상 깊은 구절로 다음 버전 음악 생성 (v0 음악 생성 후 활성화) ---
if st.session_state.music_versions: # 생성된 음악이 하나라도 있을 경우 다음 버전 생성 UI 표시
    st.write("---")
    next_version_num = len(st.session_state.music_versions)
    st.header(f"Step 2: 인상 깊은 구절로 다음 음악(v{next_version_num}) 만들기")
    with st.form(f"v_next_music_form"):
        new_passage_input = st.text_area(
            "음악에 새롭게 반영하고 싶은 인상 깊은 구절이나 아이디어를 입력하세요:",
            height=150,
            key=f"passage_input_v{next_version_num}",
            placeholder="예: '고요한 밤, 별빛 아래 홀로 걷는 주인공의 외롭지만 평화로운 감정'"
        )
        duration_next_music = st.slider("생성할 음악 길이 (초)", 10, 60, 15, key=f"duration_v{next_version_num}")
        submitted_next_music = st.form_submit_button(f"v{next_version_num} 음악 생성하기")
    if submitted_next_music and new_passage_input:
        if not st.session_state.last_llm_generated_prompt:
            st.error("오류: 업데이트의 기반이 될 이전 AI 생성 음악 프롬프트가 없습니다. 먼저 v0 음악을 생성해주세요.")
            st.stop()
        with st.spinner(f":높은음자리표: v{next_version_num} 음악 프롬프트 업데이트 중 (GPT-4o-mini)..."):
            # 업데이트 시에는 '사용자 입력 구절'과 '이전에 LLM이 생성한 음악 프롬프트'를 함께 사용
            updated_llm_prompt, error = generate_music_prompt_with_llm(
                new_passage_input,
                existing_prompt_from_llm=st.session_state.last_llm_generated_prompt # 이전 LLM 생성 프롬프트 전달
            )
            if error:
                st.error(error)
                st.stop()
            st.session_state.last_llm_generated_prompt = updated_llm_prompt # 최신 LLM 생성 프롬프트로 업데이트
            st.success(f"v{next_version_num} 음악 프롬프트가 성공적으로 업데이트되었습니다!")
        with st.spinner(f":음표: v{next_version_num} 음악 생성 중 (MusicGen)... 약 {duration_next_music // 60 + 1}분 소요될 수 있습니다."):
            new_audio_url, error = generate_music_with_musicgen_api(updated_llm_prompt, duration_next_music)
            if error:
                st.error(error)
                st.stop()
            # 생성된 다음 버전 음악 정보를 세션 상태 리스트에 추가
            st.session_state.music_versions.append({
                "version_name": f"v{next_version_num} (구절 추가)",
                "llm_prompt": updated_llm_prompt,
                "audio_url": new_audio_url,
                "based_on_text": f"추가된 구절: {new_passage_input[:100]}... (이전 프롬프트: '{st.session_state.music_versions[-2]['llm_prompt'][:30]}...' 기반)" if len(st.session_state.music_versions) > 1 else f"추가된 구절: {new_passage_input[:100]}..."
            })
            st.success(f":짠: v{next_version_num} 음악이 성공적으로 생성되었습니다!")
            st.balloons()
            st.experimental_rerun() # UI를 다시 그려서 음악 목록 업데이트 및 다음 입력 폼 준비
    elif submitted_next_music and not new_passage_input:
        st.warning("음악에 반영할 인상 깊은 구절을 입력해주세요.")
# --- 사이드바 정보 ---
st.sidebar.header("사용 방법")
st.sidebar.markdown("""
1.  *Step 1 (초기 음악 생성 - v0):*
    *   책 제목과 저자 이름을 입력하고 'v0 음악 생성하기' 버튼을 클릭합니다.
    *   책 설명 기반의 첫 번째 음악(v0)과 해당 음악 생성에 사용된 AI 프롬프트가 생성되어 표시됩니다.
2.  *Step 2 (다음 버전 음악 생성 - v1, v2...):*
    *   v0 음악이 생성된 후, 'Step 2' 섹션이 나타납니다.
    *   음악에 새롭게 반영하고 싶은 인상 깊은 구절이나 아이디어를 입력합니다.
    *   'vN 음악 생성하기' 버튼을 클릭하면, *이전에 AI가 만들었던 음악 프롬프트*와 *새로운 구절*을 AI가 함께 고려하여 *창의적으로 재구성한 새 프롬프트*로 다음 버전의 음악이 생성됩니다.
    *   생성된 모든 버전의 음악과 프롬프트는 히스토리 목록에 누적되어 표시됩니다.
""")
st.sidebar.markdown("---")
st.sidebar.caption("Powered by Replicate (GPT-4o-mini, MusicGen) & Google Books API")