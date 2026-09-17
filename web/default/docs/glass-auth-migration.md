# Glass authentication, setup and errors

Date: 2026-09-16. Scope: layout and materials only. No authentication,
authorization, recovery, setup, redirect, retry or error handling was changed.

## Authority and page coverage

The user-approved live Keys reference is `.artifacts/glass-rollout/approved-keys.png`.
The exact implementation material is white at 2%, 24px backdrop blur, a 0.5px
alpha-white conic edge (right-top/left-bottom brighter), 80% white primary text and
60% white secondary text. The existing nebula wallpaper remains unchanged. There
is no texture inside the glass, opaque gray card, game sprite or console Dock on
these standalone screens. All form labels, descriptions and actions come from
the existing source, not from generated lettering.

Each row below had a separate built-in ImageGen call completed before code edits.
The two reset aliases and two OAuth aliases each share the same actual component
and therefore share one demo. The setup wizard's four existing stages share one
wizard-layout demo, with all stage implementations preserved.

| Actual screen                | Demo artifact under `.artifacts/glass-rollout/` | Existing behavior preserved                                                                                           |
| ---------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------- |
| `/sign-in`                   | `sign-in-demo.png`                              | Password/Passkey, configured OAuth, WeChat, Turnstile, legal acceptance, registration visibility and redirect         |
| `/sign-up`                   | `sign-up-demo.png`                              | Username/password, conditional email verification, legal acceptance, configured OAuth and registration flags          |
| `/forgot-password`           | `forgot-password-demo.png`                      | Existing email form and reset-link submission                                                                         |
| `/otp`                       | `otp-demo.png`                                  | Six-digit input in 2+2+2 groups, backup-code mode, verification and back-to-login                                     |
| `/reset`, `/user/reset`      | `reset-password-demo.png`                       | Invalid-link state, read-only email, confirmation, generated-password display/copy, retry cooldown and login redirect |
| `/oauth`, `/oauth/$provider` | `oauth-demo.png`                                | Provider and bind/login mode, processing status and existing automatic redirect flow                                  |
| `/setup`                     | `setup-demo.png`                                | Database inspection, root account, usage mode, review and initialization; loading/retry states and language selector  |
| `/401`                       | `error401-demo.png`                             | Existing unauthorized message, Back and Home                                                                          |
| `/403`                       | `error403-demo.png`                             | Existing forbidden message, Back and Home                                                                             |
| `/404`                       | `error404-demo.png`                             | Existing not-found message, Back and Home                                                                             |
| `/500`                       | `error500-demo.png`                             | Existing error/status including 429 and minimal mode, Back, GitHub report link and Home                               |
| `/503`                       | `error503-demo.png`                             | Existing maintenance message and Learn more button, without inventing a destination                                   |

## ImageGen prompt record

Every prompt used the approved Keys PNG as its sole visual reference and the
following common prefix:

> Use case: ui-mockup. Generate ONE 1440x1000 desktop Dot API screen. Reference image is the user-approved material and wallpaper ONLY, not its key content. Exact nebula background dark navy/purple with warm glow upper right. Restraint: 2% white frosted glass fill, 24px blur, very fine 0.5px conic white edge highlight, 80% white main text and 60% secondary white, no inner texture, no game artwork, no flat gray/colored panels. Center one readable 460px-wide glass form panel, 28px corner radius. Top-left only small floating Dot API brand pill, no console Dock, no balance, no sidebar, no invented stats or navigation. Pill buttons and inputs, quiet Untitled-style line icons, careful 24/32px spacing. Chinese UI labels, preserve described controls, no invented functions or slogans.

Individual screen suffixes:

### Sign in

> Sign in page. Title 登录. Existing fields 用户名或邮箱, 密码 with eye reveal, 忘记密码 link beside password label, 登录 primary pill, 没有账户? 注册 link. Optional existing Passkey sign-in and OAuth provider buttons shown as modest outlined glass pills under normal login, and legal acceptance below. No remember-me, no new provider list beyond GitHub and existing WeChat. Existing text only, no other data.

### Sign up

> Create account page. Title 创建账户, 已有账户? 登录 link. Form fields 用户名, 密码, 确认密码, 邮箱 and 验证码 with 发送验证码 side button, legal agreement checkbox, 创建账户 primary pill. Existing OAuth options subordinate below. No referral reward, no subscription, no new functionality. Tall compact form that remains readable.

### Forgot password

> Forgot password page. Title 忘记密码. Explain 输入您的注册邮箱，我们将发送重置密码链接. One 邮箱 field, 发送重置链接 primary pill, 没有账户? 注册 link. No other inputs or verification checkbox. Calm concise visual hierarchy.

### OTP

> Two-factor sign in page. Title 双重验证; existing instruction 请输入验证码. Show exactly six OTP boxes arranged as 2 + 2 + 2 with small separators, form label 验证码, note 验证码每30秒更新, pill 验证并登录, two text links 使用备用码 and 返回登录, plus 会话过期? 重新登录. Do not invent recovery email, remembered device checkbox or other controls. Centered form panel.

### Reset confirmation

> Password reset confirmation page before confirmation. Title 重置密码, explanation 请确认您的邮箱以重置密码. Read-only 邮箱 input showing name@example.com, primary 确认重置 button, 返回登录 text button. This code generates a password after confirmation, so do NOT add new-password fields, confirmation-password fields or strength meter. Can show small quiet note explaining completion, no fictitious fields or automatic-success state.

### OAuth callback

> OAuth callback progress screen for existing GitHub provider. Small GitHub line logo, centered title 正在使用 GitHub 登录, support 正在完成账户连接. Small spinner with 正在处理 OAuth 响应… and text 您将自动跳转. No user-entered fields, no provider chooser, no invented retry/logout button. Keep compact glass progress card with calm typography. No percentages or fake progress bars.

### Setup

> Initial system setup wizard. Wider 960px glass panel rather than narrow auth panel. Top logo 初始化 Dot API and existing explanatory text; top-right small language control. Four existing steps in thin translucent rounded step tiles: 数据库检查 / 管理员账户 / 使用模式 / 确认并初始化. Show step2 active with 用户名, 密码, 确认密码 field rows, backend note if already initialized not invented. Footer 返回 and 下一步 pills at opposite ends. Preserve four stages, no extra step, no deployment setting, no paid plan, no new mode. Strong aligned labels, no decorative illustration.

### 401

> Standalone 401 unauthorized screen. No brand header if code does not show it. A single centered restrained glass panel 560px wide. Large but refined 401 number in white80%, title 未授权访问, body 请使用适当的凭据登录，以访问此资源. Exactly two existing pill buttons 返回 and 返回首页. No sign-in form, no new logout control, no illustration or icon tile. Screenshot should feel consistent with approved glass style.

### 403

> Standalone 403 forbidden screen. No brand header. One centered restrained glass panel 560px wide. Large refined 403 number, title 访问被禁止, description 您没有查看此资源所需的权限. Exactly two existing buttons 返回 and 返回首页. No new request-access or contact-admin features. Keep white80/60 text, no opaque red panel, no illustration.

### 404

> Standalone 404 not found page. Omit brand header. A single centered glass panel, 560px wide. Large refined 404 number, title 页面未找到, description 您查找的页面不存在或已被移除. Exactly existing two pills 返回 and 返回首页. No search, no suggested pages, no contact support, no decorative illustration.

### 500

> Standalone 500 server error page. Omit brand header. Single centered glass panel, 600px wide. Large refined 500 number, title 出了点问题, text 很抱歉给您带来不便，请稍后重试. Existing note 如果问题持续存在，请在 GitHub Issues 上报告. Exactly three buttons 返回, 报告问题, 返回首页. No automatic retry countdown, no fabricated status or additional tools.

### 503

> Standalone 503 maintenance screen. Omit brand header. Single centered glass panel, 560px wide. Large refined 503 number, title 网站正在维护中, description 当前暂时无法访问，我们将很快恢复上线. Exactly ONE existing button 了解更多. Do not invent outage end time, progress meter, newsletter, back button, contact support or reload. Calm white text and fine glass frame.

## Deliberate implementation corrections

- Generated error mockups still included a brand pill; it is not in source and
  was not added. Generated OAuth logos are not a source of provider availability.
- Generated reset explanation was not copied: no promise that a generated
  password would be emailed, and no new password-entry fields.
- Screenshots overstate the glass fill in places; CSS remains exact white 2%.
- No demo account, sample credential, statistic or generated wording was added.
- Form labels and errors remain intact. Decorative OAuth dividing lines alone
  are removed; the existing “Or continue with” text is retained.
- Existing step tiles remain informative, not newly clickable navigation.
- Reduced-transparency / increased-contrast preferences receive an opaque
  readable fallback; normal mode remains the requested material.

## Integration and verification

Import `src/styles/glass-auth.css` after `src/styles/console-glass.css`. The shared
authentication root, setup root and five error roots each opt into the skin.
Local component changes add styling hooks only. No API, auth hook, route,
translation, validation, payload or side-effect code changed.

Implementation complete. Targeted formatter and linter pass; `bun run typecheck`
and `git diff --check` pass. The static design scan reports 0 primary findings;
its 29 advisory notes compare the new user-approved glass palette/type scale to
the older game-era DESIGN.md and do not override this brief. Three existing
nested JSX ternaries in the setup wizard were expressed as equivalent boolean
render conditions/class conditions to satisfy the targeted linter, without
changing the rendered states.

The wallpaper URL uses a source-relative public-asset path for Rsbuild resolution.
Browser comparison is assigned to the parent agent; no live login, password reset,
initialization or other state-changing form was submitted here. Visual QA is
pending and must not be reported as passed until that comparison is complete.
