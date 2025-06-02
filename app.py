import streamlit as st
import requests
import time
import replicate

# Streamlit UI
st.title("📚 책에서 음악으로: 감성 기반 음악 생성기")
book_title = st.text_input("책 제목을 입력하세요")
book_author = st.text_input("저자 이름을 입력하세요")

if st.button("음악 생성하기"):
    # Step 1: Google Books API 입력 찾기
    with st.spinner("책 설명 검색 중..."):
        query = f"{book_title}+inauthor:{book_author}"
        response = requests.get(f"https://www.googleapis.com/books/v1/volumes?q={query}")
        items = response.json().get("items")
        if not items:
            st.error("책 정보를 찾을 수 없습니다.")
            st.stop()
        description = items[0]["volumeInfo"].get("description", "설명이 없습니다.")
        st.success("책 설명을 가져왔습니다!")
        st.markdown(f"**책 설명:** {description}")

    # Step 2: Replicate LLM으로 음악 프롬프트 생성
    # Prompt 생성
    st.spinner("음악 프롬프트 생성 중...")
    output = replicate.run(
        "openai/gpt-4o-mini",
        input={
            "prompt"
            : f"You are a music prompt engineer for an AI music generation system. Create a prompt for generating instrumental background music from this book description: {description}, The music should be designed to be listened to while reading, so it must be relaxing and without vocals or lyrics. Except for the rush of thanks and words. Just print out the prompts for music creation.",
            "temperature": 0.7,
            "max_completion_tokens": 1024
        }
    )

    # 출력 결과 스트링으로 정리
    music_prompt = "".join(output) if isinstance(output, list) else str(output)
    st.success("프롬프트 생성 완료!")
    st.markdown(f"{music_prompt}")

    # Step 3: MusicGen으로 음악 생성
    with st.spinner("음악 생성 중..."):
        try:
            output = replicate.run(
                "meta/musicgen:671ac645ce5e552cc63a54a2bbff63fcf798043055d2dac5fc9e36a837eedcfb",
                input={
                    "prompt": music_prompt,
                    "model_version": "large",
                    "output_format": "mp3",
                    "duration": 15,
                    "normalization_strategy": "peak"
                }
            )
            audio_url = str(output)
            audio_data = requests.get(audio_url).content
            st.audio(audio_data, format="audio/mp3")

        except Exception as e:
            st.error(f"음악 생성 중 오류 발생: {str(e)}")

