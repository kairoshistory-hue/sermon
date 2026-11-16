# Yongin Onnuri Church Sermon

https://sermon-six.vercel.app

## 새 설교 올리는 방법
1. 설교 파일(`.md`)과 요약 파일(`.summary.md`)을 준비합니다. (Claude에게 원문을 주면 만들어 줍니다)
2. GitHub 저장소에서 `content/sermons` 폴더로 들어가 **Add file → Upload files**로 두 파일을 올립니다.
3. 1~2분 뒤 사이트에 자동 반영됩니다.

## 파일 이름 규칙
`날짜-설교자-회차.md` 예) `2026-11-22-yang-10.md`, `2026-11-22-yang-10.summary.md`
설교는 **교회 폴더**(온누리교회 용인 / 온누리교회 서빙고)로 자동 분류됩니다.

## 설교 파일 맨 위 정보
```
---
title: 설교 제목
series: 사사기 강해(10)
passage: 사사기 12:1-7
preacher: 양재경 목사
service: 주일 2부 예배
date: 2026-11-22
church: yongin        # 선택: yongin(온누리교회 용인) 또는 seobinggo(온누리교회 서빙고). 생략하면 설교자로 자동 분류
youtube: https://www.youtube.com/watch?v=...
---
```
본문에서 `## 소제목`, `> 성경 인용`을 쓸 수 있습니다.

## 담당 목사님이 바뀌면
`lib/churches.ts` 의 `PREACHER_CHURCH` 에 새 설교자 이름과 교회(yongin / seobinggo)를 추가하세요.
또는 설교 파일 맨 위에 `church: yongin` (또는 `seobinggo`) 한 줄만 적어도 됩니다. 예전 설교는 그대로 교회 폴더에 남습니다.
