<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/14cb301a-6b66-42ff-9be1-c1a0587ed0af

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Set the `GEMINI_API_KEY` in [.env.local](.env.local) to your Gemini API key
3. Run the app:
   `npm run dev`

## Supabase 주문 저장소

1. Supabase 프로젝트의 SQL Editor에서 앱의 `SUPABASE_SQL_SCRIPT`에 있는 SQL을 실행합니다.
2. `.env.local`에 `VITE_SUPABASE_URL`과 `VITE_SUPABASE_ANON_KEY`를 설정합니다. Supabase의 publishable/anon key만 사용하고 `service_role` key는 프런트엔드에 넣지 마세요.
3. 개발 서버를 다시 시작합니다. 설정이 없으면 앱은 기존 localStorage를 사용합니다.

이 SQL은 데모용으로 익명 사용자에게 주문 조회·등록·전체 삭제를 허용합니다. 공개 배포 전에 인증을 추가하고 RLS 정책에서 전화번호와 삭제 권한을 제한하세요.
