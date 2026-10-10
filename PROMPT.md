# Skills yang harus dipakai
design-taste-frontend, design-taste-frontend-v1, gpt-taste, high-end-visual-design,
stitch-design-taste, imagegen-frontend-web, impeccable, animate, ask-sonner, break-ui,
emil-design-eng, find-animation-opportunities, improve-animations, pick-ui-library,
apply-aesthetic, data-dashboard, design-code, performance, ux-writing, ui-craft,
ui-craft-dense-dashboard, ui-ux-pro-max

Muat semua skill di atas dengan Skill tool sebelum mulai.

# Prompt
You are a senior full-stack engineer, UI/UX designer, software architect, and product implementation specialist.

Your task is to completely redesign, rebuild, and improve the existing FRITZYFORCE fanbase website using the current GitHub repository, the existing website, the requirements discussed by the team, and the feature specifications contained in the provided Google Sheets.

This is a FULL WEBSITE REDESIGN AND IMPLEMENTATION PROJECT.

Do not interpret this task as merely redesigning the About Us page or the fanbase profile page. The entire website, from the homepage to the Fritzy profile, schedules, and all other required pages, must be reviewed and redesigned according to the actual requirements.

You must implement a complete, functional, production-ready website rather than producing only a design proposal, static mockup, or implementation plan.

==================================================
1. PROJECT IDENTITY
==================================================

Project name: FritzyForce

Existing website:
https://fritzyforce.my.id/

Google Sheets feature specifications:
https://docs.google.com/spreadsheets/d/1C8ZWs_Ct7D74AaXtYILXI85Kd65SyvMRqNh1GgrAQ7A/edit?gid=1378137246#gid=1378137246

Primary brand colors:
- Purple
- White

Primary objective:

Completely redesign and improve the entire FritzyForce website based on the existing website, the team's discussions, and the feature specifications in Google Sheets.

The final result must be modern, polished, responsive, maintainable, functional, and suitable for a real fanbase community.

The website must have a coherent identity that represents FritzyForce rather than looking like a generic website template.

IMPORTANT:

The existing website is a reference for understanding the current project, its content, and its functionality. Do not assume that the existing design or page structure must remain unchanged.

Some pages and features may need substantial changes based on the team's discussions and the spreadsheet.

==================================================
2. MANDATORY REQUIREMENTS DISCOVERY
==================================================

Before implementing anything, thoroughly inspect the following sources:

1. The existing website:
   https://fritzyforce.my.id/

2. The Google Sheets document:
   https://docs.google.com/spreadsheets/d/1C8ZWs_Ct7D74AaXtYILXI85Kd65SyvMRqNh1GgrAQ7A/edit?gid=1378137246#gid=1378137246

3. The existing GitHub repository selected for this task.

4. Existing assets, images, logos, fonts, components, routes, API integrations, database schemas, and project documentation found in the repository.

The Google Sheets document contains two relevant tabs:

- Fanbase Profile New
- Fanbase Profile

Both tabs must be reviewed.

The "Fanbase Profile New" tab contains additional requirements and changes that must be compared with the older "Fanbase Profile" tab.

Do not inspect only one tab and assume the requirements are complete.

YOUR RESPONSIBILITIES:

- Identify the requirements in both tabs.
- Compare old and new requirements.
- Identify newly requested features.
- Identify features that have changed.
- Identify existing features that must be retained.
- Identify existing pages that need substantial redesign.
- Identify features that should be removed or replaced if the specifications require it.
- Identify requirements that remain unclear or conflict with other requirements.
- Inspect the current website to understand its existing behavior.
- Inspect the repository to determine what has already been implemented.

Create an internal requirements checklist before coding.

For each requirement, determine:

- What the feature is.
- Which page or component it belongs to.
- Whether it already exists.
- Whether it needs a redesign, modification, or new implementation.
- Whether it requires a database, API, authentication, or file storage.
- How its functionality will be tested.

GOOGLE SHEETS ACCESS RULES:

You must attempt to access and inspect the actual spreadsheet.

Do not invent requirements or pretend that you have read the spreadsheet if access fails.

If the spreadsheet cannot be accessed, try reasonable alternatives that do not bypass authentication or access controls.

If the content remains inaccessible, explicitly identify the limitation and continue by inspecting the existing website and repository.

Do not silently replace missing spreadsheet requirements with assumptions.

If an essential requirement cannot be determined, document the uncertainty and avoid implementing speculative functionality that could conflict with the intended design.

==================================================
3. GITHUB AND CLAUDE CODE CLOUD WORKFLOW
==================================================

This project is intended to be completed through Claude Code Cloud with a connected GitHub repository.

You MUST work directly within the repository environment provided by Claude Code Cloud.

Do not instruct the user to download the repository, create project files manually on their computer, or copy the implementation from the chat into a local development environment.

The objective is to perform the actual development work inside the connected repository environment.

MANDATORY WORKFLOW:

1. Inspect the currently selected GitHub repository.
2. Verify that the active branch is `main`.
3. Read the existing project structure and configuration.
4. Review the working tree and existing changes.
5. Identify the framework, package manager, dependencies, build process, and deployment configuration.
6. Review the existing implementation before changing it.
7. Preserve relevant existing functionality and content.
8. Implement the redesign directly in the repository.
9. Run available checks, tests, and production builds.
10. Fix errors introduced by your changes.
11. Review the final changes for regressions and incomplete functionality.
12. Commit and push your changes directly to `main` when the environment and permissions allow it.

==================================================
4. GITHUB WORKFLOW: MAIN BRANCH ONLY
==================================================

MANDATORY RULE: ALL WORK MUST BE DONE ON THE EXISTING `main` BRANCH.

The GitHub repository's `main` branch is the single source of truth.

You MUST follow these rules throughout the entire implementation.

A. MAIN BRANCH ONLY

- Always use the existing `main` branch.
- Before making changes, verify that the active branch is `main`.
- If the repository is on another branch, switch to `main` before starting implementation, provided doing so will not discard or overwrite existing work.
- Do not create new branches.
- Do not switch to feature, development, staging, or other branches.
- Do not create pull requests as a substitute for committing changes directly to `main`.
- Do not create a separate repository for this implementation.
- Do not silently work on another branch.

B. WORK DIRECTLY IN THE GITHUB REPOSITORY

- Work in the connected GitHub repository through the Claude Code environment.
- Do not require the user to download the project or manually transfer files to their personal computer.
- Inspect the existing repository and preserve relevant project files, configuration, and functionality.
- Implement the requested changes in the existing project rather than creating an unrelated replacement repository.

C. COMMIT AND PUSH TO MAIN

After implementation:

1. Run the available checks.
2. Fix implementation-related errors where possible.
3. Review the changed files.
4. Confirm the active branch is `main`.
5. Commit the changes directly to `main`.
6. Push the commit to the remote repository's `main` branch.
7. Verify that the push succeeded.

Use a clear, descriptive commit message.

Do not claim that changes have been committed or pushed unless the corresponding operation has actually succeeded.

D. HANDLE EXISTING CHANGES SAFELY

- Inspect the repository's working tree before modifying files.
- Never discard, reset, overwrite, or delete unrelated user changes.
- Do not use destructive Git commands merely to make the working tree clean.
- If there are conflicting changes, merge conflicts, or an unexpected repository state, resolve them safely or explain the blocker.
- If `main` has advanced remotely, synchronize carefully and preserve existing work before pushing.
- Never force-push to `main`.
- Do not overwrite another contributor's commits.

E. REPOSITORY ACCESS AND PERMISSIONS

If direct commits or pushes are blocked by GitHub permissions, repository protection rules, authentication, or the Claude Code environment:

- Explain the exact limitation.
- Continue with work that can safely be completed.
- Do not silently create another branch as a workaround.
- Do not weaken repository protection.
- Do not bypass authentication or permissions.
- Clearly report what remains blocked.

F. FINAL VERIFICATION

Verify:

- The final working branch is `main`.
- The commit exists on the remote `main` branch if pushing was successful.
- The implementation and available tests have been checked.
- The final report accurately describes what was completed.

These rules override any default workflow that would create a separate branch or submit a pull request.

Required workflow:

Inspect repository
→ Verify `main`
→ Inspect requirements
→ Implement changes
→ Run checks
→ Commit directly to `main`
→ Push to remote `main`
→ Verify and report the actual result.

Do not begin implementation on another branch.

==================================================
5. TECHNICAL STACK AND ARCHITECTURE
==================================================

First inspect the existing repository to determine whether an established stack is already in use.

If the current architecture is suitable, preserve and improve it rather than introducing unnecessary rewrites.

If a new architecture is required, use the following preferred stack:

- Next.js
- React
- TypeScript
- Next.js App Router
- Tailwind CSS
- Reusable, accessible UI components
- A suitable icon library
- Cloudflare-compatible deployment architecture

Choose dependencies carefully.

Do not introduce unnecessary packages simply to make the implementation appear more sophisticated.

The final architecture must prioritize:

- Maintainability.
- Performance.
- Security.
- Responsive design.
- Accessibility.
- Clear separation of responsibilities.
- Reliable deployment.
- Ease of future development.

Use TypeScript appropriately.

Avoid unnecessary use of `any`.

Use clear naming conventions and maintain a consistent project structure.

Do not duplicate components or business logic when a reusable implementation would be more appropriate.

Do not build the entire application as one enormous component.

==================================================
6. CLOUDFLARE DEPLOYMENT REQUIREMENTS
==================================================

The website is intended to be hosted on Cloudflare infrastructure.

Deployment compatibility is mandatory.

Before selecting or changing the deployment architecture, inspect the current official Cloudflare documentation:

https://developers.cloudflare.com/workers/framework-guides/web-apps/nextjs/

Use the current officially supported deployment approach for the chosen Next.js architecture.

Prefer Cloudflare Workers when appropriate for the application's requirements.

Do not assume that every Next.js feature or Node.js package is supported by every Cloudflare runtime.

Verify compatibility for:

- Next.js rendering.
- Server-side functionality.
- API routes and route handlers.
- Database access.
- Authentication.
- Image uploads.
- File storage.
- Scheduled tasks, if required.
- Environment variables.
- Runtime-specific APIs.
- Build and deployment commands.

If Cloudflare Pages is selected instead, verify that the chosen framework features are supported by the actual Pages deployment model.

Do not blindly combine Pages and Workers configurations.

If the application needs a database, consider Cloudflare D1.

If the application needs persistent image or file storage, consider Cloudflare R2.

Use these services only when appropriate for the actual requirements.

Do not use an incompatible Node.js server architecture or assume that a conventional standalone Next.js server can simply be deployed to Cloudflare without adaptation.

Avoid dependencies that require unsupported native modules, unrestricted filesystem access, or incompatible Node.js runtime behavior.

Before finalizing:

- Verify the build command.
- Verify the deployment configuration.
- Verify the runtime compatibility of critical dependencies.
- Verify that environment variables are correctly documented.
- Verify that database and storage bindings are configured appropriately.
- Provide accurate deployment instructions.

Do not claim the application is successfully deployed unless deployment has actually been performed and verified.

==================================================
7. FRITZYFORCE BRAND IDENTITY AND COLOR PALETTE
==================================================

The entire website MUST use PURPLE AND WHITE as its primary brand colors.

These colors must define the visual identity across all public pages and the administrative dashboard.

PRIMARY COLORS:

1. Purple
   The main brand color.

2. White
   The primary contrasting color for typography, backgrounds, interface elements, and visual balance.

SUPPORTING COLORS:

Black, charcoal, gray, and off-white may be used sparingly for readability, borders, secondary text, depth, and visual separation.

These supporting colors must never replace purple and white as the primary identity.

PURPLE PALETTE:

Establish a coherent palette using a suitable combination of:

- Primary purple.
- Dark purple.
- Light purple.
- Purple-tinted neutral backgrounds.
- Accessible purple hover and active states.
- White and off-white surfaces.

Before selecting the exact shades, inspect the existing FritzyForce logo and available brand assets in the repository.

If the logo contains an established purple shade, use it as the primary color reference.

If the exact brand color cannot be determined, choose an appropriate purple-and-white palette and define it through centralized design tokens.

Do not scatter arbitrary color values throughout the codebase.

COLOR APPLICATION:

Use the purple-and-white identity consistently across:

- Homepage.
- Fritzy profile.
- Fanbase profile.
- About Us.
- Schedule pages.
- News pages.
- Gallery pages.
- Other required public pages.
- Navigation.
- Buttons.
- Forms.
- Cards.
- Loading states.
- Empty states.
- Error states.
- Administrative dashboard.
- Authentication pages.
- Footer.
- Responsive mobile navigation.

The administrative dashboard may prioritize usability, but it must still feel connected to the FritzyForce identity.

DESIGN RESTRICTIONS:

- Do not introduce red, blue, or green as competing primary brand colors.
- Do not copy another fanbase website's color palette.
- Do not use excessive gradients.
- Do not fill every component with purple.
- Do not use excessive neon-purple glow effects.
- Do not make the design depend on glowing borders and shadows.
- Do not use random decorative effects without a clear purpose.
- Do not sacrifice readability for aesthetics.
- Do not make purple text difficult to read against purple backgrounds.
- Do not use low-contrast white text on light-purple surfaces.
- Do not make every card, button, and section look identical.

Maintain sufficient contrast and use white space strategically.

DESIGN CHARACTER:

The final design should feel:

- Professional.
- Modern.
- Distinctive.
- Clean.
- Visually cohesive.
- Recognizably FritzyForce.
- Suitable for a real fanbase community.
- Carefully designed rather than automatically assembled from a generic template.

The website must not look like generic AI-generated output.

==================================================
8. OVERALL REDESIGN OBJECTIVE
==================================================

Completely redesign the existing FritzyForce website.

The scope includes the entire website, not just its fanbase profile.

Review every existing route and page.

Determine which pages should be retained, modified, redesigned, consolidated, or replaced according to the actual requirements.

The new design must have a consistent visual language across the entire website.

This includes:

- Typography.
- Color usage.
- Spacing.
- Layout.
- Navigation.
- Buttons.
- Forms.
- Cards.
- Icons.
- Images.
- Responsive behavior.
- Animations.
- Loading states.
- Empty states.
- Error states.
- Footer.
- Administrative interfaces.

Create a cohesive design system before implementing page-specific layouts.

Avoid designing each page as if it belonged to a different website.

Do not merely apply purple colors to the old design and call it a redesign.

The layout, information hierarchy, user experience, and component structure should be improved where appropriate.

==================================================
9. WEBSITE INFORMATION ARCHITECTURE
==================================================

Determine the complete information architecture by comparing the existing website with the Google Sheets requirements.

Build a route and page checklist.

Potential pages may include the following, but the spreadsheet and actual project requirements must determine the final scope.

A. Homepage.

B. Fritzy profile.

C. Fanbase profile.

D. About Us.

E. Schedule.

F. News and announcements.

G. Gallery.

H. Projects and activities.

I. Community participation or submissions.

J. Other pages explicitly required by the spreadsheet.

Do not automatically implement every optional page listed above if it is not relevant to the requirements.

Likewise, do not omit a required page simply because it is not listed in this example.

For every required page, determine:

- Its purpose.
- Its target audience.
- Its content.
- Its layout.
- Its navigation entry.
- Its required interactions.
- Its data sources.
- Its administrative management requirements.
- Its mobile behavior.

Ensure that users can navigate the website without confusion.

Use a consistent navigation structure.

Avoid excessive navigation items, redundant pages, and unnecessary nested menus.

If the existing website has routes that must remain available, preserve them where appropriate or implement suitable redirects when the route structure changes.

Do not break existing links unnecessarily.

==================================================
10. HOMEPAGE
==================================================

Redesign the homepage as the main entry point to FritzyForce.

The homepage must communicate the identity and purpose of the fanbase immediately.

Its content and sections must be based on the actual project requirements.

Potential elements include:

- A clear hero section.
- Fritzy-related visual content.
- Fanbase identity.
- Important announcements.
- Upcoming schedules.
- Recent news.
- Gallery previews.
- Community projects.
- Important links.
- Calls to action relevant to the fanbase.
- Footer navigation.

These are examples, not mandatory sections regardless of context.

Use the spreadsheet to determine which features actually belong on the homepage.

DESIGN REQUIREMENTS:

- Strong visual hierarchy.
- Consistent purple-and-white branding.
- Carefully selected imagery.
- Appropriate spacing.
- Clear typography.
- Responsive layouts.
- Subtle, purposeful animations.
- Clear calls to action.
- No unnecessary visual clutter.

Do not put every available feature on the homepage.

Prioritize the information that matters most to visitors.

Do not use placeholder statistics, fake announcements, or invented community activity.

==================================================
11. FRITZY PROFILE PAGE
==================================================

Implement and redesign the Fritzy profile page according to the requirements.

The page should present relevant profile information in a polished and organized layout.

Use the spreadsheet and existing website to determine the required fields and content.

Potential information may include:

- Profile image.
- Display name.
- Biography.
- Relevant profile details.
- Activities.
- Schedule information.
- Related news.
- Gallery content.
- Official or verified links, where available and appropriate.

Do not invent personal information.

Do not fabricate statistics, schedules, achievements, or social media accounts.

Use verified information from the existing project or approved content sources.

If profile data is managed through the admin dashboard, implement the corresponding data model and editing interface.

Avoid hardcoding content that administrators are expected to update regularly.

==================================================
12. FANBASE PROFILE AND ABOUT US
==================================================

The fanbase profile is an important part of this project, but it is not the entire project.

Redesign this section according to the requirements from Arie and the Google Sheets document.

Do not interpret "buat yang fanbase profile" as permission to redesign only one page.

The requested scope includes the entire FritzyForce website, from the homepage through the Fritzy profile, schedules, and all other required pages.

The fanbase profile and About Us pages should communicate the identity, purpose, activities, and relevant information about FritzyForce.

Use the spreadsheet to determine the actual content structure.

Avoid generic filler text.

Do not invent the fanbase's history, member count, achievements, partnerships, or other facts.

If the project requires these details to be editable, provide the appropriate content management functionality.

Ensure that the page remains visually consistent with the rest of the website.

==================================================
13. SCHEDULE PAGES
==================================================

Inspect the existing schedule implementation and the spreadsheet requirements.

Determine which types of schedules are required and how they should be displayed.

Do not assume that every type of schedule is needed.

If the website requires event schedules, theater schedules, video call schedules, or other activity schedules, implement only the relevant types according to the specifications.

Where appropriate, provide:

- Clear date and time displays.
- Event titles.
- Event categories.
- Relevant status indicators.
- Detailed information.
- Empty states.
- Loading states.
- Error handling.
- Mobile-friendly layouts.

Use a consistent date and time format.

Pay attention to the intended time zone, especially for events.

If schedule data comes from an external API, use the documented API contract and implement proper loading, validation, caching, and error handling.

If schedules are managed manually, provide appropriate administrative controls.

If both methods are required, design the architecture accordingly.

Do not fabricate upcoming schedules.

Do not display fake events to make the page appear populated.

==================================================
14. NEWS AND ANNOUNCEMENTS
==================================================

Inspect the spreadsheet and existing website to determine whether news and announcements are required.

If required, implement a complete news experience rather than a static list of hardcoded cards.

Depending on the specifications, provide:

- News listing.
- Individual news detail pages.
- Article titles.
- Publication dates.
- Featured images.
- Article content.
- Categories or tags.
- Pagination or another appropriate listing mechanism.
- Search or filtering when required.
- Loading states.
- Empty states.
- Error handling.
- Responsive article layouts.

If the website needs an administrative content management system, allow authorized administrators to create, edit, publish, unpublish, and delete articles as appropriate.

Use a suitable content model.

Generate stable, readable URLs for individual articles.

Ensure that metadata and social-sharing previews are configured appropriately.

Do not fabricate news articles or represent placeholder content as genuine announcements.

==================================================
15. GALLERY
==================================================

Inspect the requirements to determine the intended gallery functionality.

If a gallery is required, implement a polished and responsive visual experience.

Depending on the actual requirements, support:

- Image grids.
- Album or category organization.
- Image detail views.
- Responsive image sizing.
- Lazy loading.
- Appropriate aspect ratios.
- Image optimization.
- Accessible alternative text.
- Loading states.
- Empty states.
- Error handling.

If the gallery must be managed through an admin dashboard, implement the corresponding upload and management functionality.

Use Cloudflare R2 or another compatible storage solution when persistent image uploads are required and appropriate.

Do not rely on temporary local filesystem storage for uploaded images in a serverless production environment.

Do not invent image URLs or assume that external images will remain available indefinitely.

Inspect existing repository assets before sourcing or replacing images.

==================================================
16. OTHER REQUIRED PAGES AND FEATURES
==================================================

Review both Google Sheets tabs carefully.

Identify every additional page, feature, content field, interaction, or administrative capability specified by the team.

Implement all applicable requirements.

Do not restrict the implementation to the pages described in this prompt.

This section exists to ensure that features discussed by Arie, Kezia, Oink, or other stakeholders are not omitted merely because they are not explicitly described here.

For each additional requirement:

1. Understand the intended behavior.
2. Determine where it belongs in the application.
3. Design its interface.
4. Implement its functionality.
5. Connect it to the correct data source when necessary.
6. Include appropriate validation and error handling.
7. Make it responsive.
8. Test its behavior.

Do not create speculative features merely to make the website appear more extensive.

The spreadsheet and existing project determine the actual scope.

==================================================
17. ADMIN DASHBOARD AND CONTENT MANAGEMENT
==================================================

Inspect the spreadsheet to determine which administrative capabilities are required.

If an admin dashboard is required, implement a real, functional dashboard rather than a visual mockup.

Its capabilities must correspond to the actual content and features that administrators need to manage.

Potential modules include:

- Dashboard overview.
- Profile management.
- Fanbase information management.
- News management.
- Schedule management.
- Gallery management.
- Announcement management.
- Community submission management.
- Site settings.
- User or administrator management.
- Other modules required by the spreadsheet.

These modules are examples. Do not implement unnecessary modules without a requirement.

ADMIN DASHBOARD REQUIREMENTS:

- Consistent purple-and-white branding.
- Clear navigation.
- Responsive layouts.
- Appropriate forms.
- Input validation.
- Confirmation before destructive actions.
- Clear success and error feedback.
- Loading indicators.
- Empty states.
- Search, sorting, and filtering where useful.
- Pagination when appropriate.
- Protected administrative routes.
- Proper server-side authorization.
- Secure session handling.

If authentication is required, implement real authentication using an appropriate, Cloudflare-compatible approach.

Do not create a fake login form that accepts arbitrary credentials.

Do not expose administrative functions to unauthenticated users.

Do not store plaintext passwords.

Do not rely exclusively on client-side checks to protect administrative functionality.

Every sensitive operation must be authorized on the server or in the relevant trusted execution environment.

If roles or permissions are required, implement them according to the project requirements.

Do not add unnecessary user roles that are not needed.

==================================================
18. DATABASE AND DATA MODEL
==================================================

Inspect the existing database and data models before creating new ones.

If persistent data is required, design a schema that supports the actual features.

Potential entities may include:

- Profiles.
- Fanbase information.
- News articles.
- Schedules.
- Gallery albums.
- Gallery images.
- Announcements.
- Submissions.
- Administrator accounts.
- Site settings.

These entities are examples, not a mandatory schema.

Use the actual spreadsheet requirements to determine which entities are necessary.

DATABASE REQUIREMENTS:

- Use consistent naming conventions.
- Define appropriate primary keys.
- Define foreign keys where supported and appropriate.
- Add indexes for common query patterns.
- Validate input.
- Handle missing or invalid data.
- Use migrations or a documented schema initialization process.
- Avoid unnecessary duplication.
- Avoid storing large image files directly in database records.
- Store image metadata and storage references when appropriate.
- Handle database errors safely.
- Document database initialization and deployment.

If Cloudflare D1 is appropriate, use it with the currently supported integration method.

Do not assume a conventional database driver is compatible with the Cloudflare runtime.

Do not introduce a database solely because it appears in this prompt if the existing architecture already provides an appropriate solution.

==================================================
19. IMAGE UPLOADS AND FILE STORAGE
==================================================

If the requirements include image uploads or other persistent file uploads, implement the complete upload workflow.

This may include:

- Upload interface.
- File type validation.
- File size limits.
- Server-side validation.
- Safe storage.
- Image metadata.
- Upload progress where supported.
- Upload failure handling.
- Image preview.
- Deletion.
- Replacement.
- Permission checks.

Use Cloudflare R2 when it is appropriate for persistent file storage.

Use the correct Cloudflare bindings and compatible APIs.

Do not assume files written to a local server filesystem will persist in production.

Do not expose private storage credentials to the browser.

Do not permit unrestricted file uploads.

Validate file content and type rather than trusting a filename or browser-provided MIME type alone.

Use appropriate public or private access policies according to the intended content.

For public gallery images, ensure that the delivery method is compatible with the deployment architecture.

==================================================
20. API INTEGRATIONS
==================================================

Inspect the existing project and spreadsheet to determine whether external API integrations are required.

Do not invent integrations.

If the requirements specify JKT48Connect API or another external service, inspect the available official documentation and use the documented endpoints, parameters, response formats, and authentication requirements.

Do not assume endpoint paths, field names, or response formats.

Do not fabricate API responses.

Do not expose secret API keys or private credentials in client-side code.

If an API key must remain private, access the service through an appropriate server-side or Cloudflare-compatible layer.

Implement:

- Input validation.
- Error handling.
- Request timeouts where supported.
- Appropriate caching.
- Rate-limit awareness.
- Safe logging.
- Graceful fallback behavior.
- Loading states.
- Empty states.
- User-friendly error messages.

Do not make the entire website unusable when an optional external API is unavailable.

Do not fabricate real-time information if the API request fails.

If an integration cannot be implemented because credentials or access are unavailable, document the limitation and provide a clear configuration path without pretending the integration works.

==================================================
21. SECURITY REQUIREMENTS
==================================================

Security is mandatory.

Inspect the existing security architecture and improve it where necessary.

At minimum, consider:

- Server-side authorization.
- Authentication.
- Secure session management.
- Input validation.
- Output encoding.
- Protection against cross-site scripting.
- Protection against SQL injection.
- CSRF protection where applicable.
- Secure cookie settings.
- Rate limiting for sensitive endpoints where appropriate.
- Safe file uploads.
- Secure environment variable handling.
- Error messages that do not reveal secrets.
- Appropriate HTTP security headers.
- Dependency security.
- Access control for administrative operations.

Do not hardcode secrets.

Do not expose credentials in client bundles.

Do not commit `.env` files containing real secrets.

Provide an `.env.example` file containing variable names and safe placeholder values if appropriate.

Do not use weak placeholder authentication in production.

Do not disable security controls merely to make deployment easier.

Do not claim the website is secure solely because it builds successfully.

==================================================
22. PERFORMANCE AND OPTIMIZATION
==================================================

Optimize the website for real-world use, especially on mobile devices and slower connections.

Consider:

- Server rendering where appropriate.
- Static rendering for content that does not need to be dynamic.
- Appropriate caching.
- Image optimization.
- Lazy loading.
- Reduced unnecessary JavaScript.
- Code splitting.
- Efficient database queries.
- Efficient API requests.
- Avoiding repeated requests for identical data.
- Avoiding unnecessary client-side rendering.
- Avoiding excessive animation work.
- Reducing layout shifts.
- Proper loading states.

Use the Next.js features that are compatible with the selected Cloudflare deployment architecture.

Do not introduce performance optimizations that break functionality.

Do not add heavy animation libraries without a clear benefit.

Avoid excessive dependencies.

The website should load quickly and remain usable on mid-range Android devices.

==================================================
23. RESPONSIVE DESIGN
==================================================

The entire website must be responsive.

Do not optimize only for desktop.

Test and refine layouts for:

- Small mobile screens.
- Typical Android phone screens.
- Larger mobile screens.
- Tablets.
- Laptops.
- Desktop monitors.

Ensure that:

- Navigation works on mobile.
- Content does not overflow horizontally.
- Text remains readable.
- Buttons are easy to interact with.
- Forms remain usable.
- Cards adapt to available space.
- Images maintain appropriate proportions.
- Tables or data-heavy components remain usable.
- Dialogs and menus fit within the viewport.
- Administrative pages work on mobile where applicable.

Avoid simply shrinking the desktop layout.

Use layouts and interactions appropriate to each screen size.

==================================================
24. TYPOGRAPHY AND VISUAL HIERARCHY
==================================================

Establish a consistent typography system.

Choose fonts that fit the FritzyForce identity and remain readable.

Inspect existing brand assets and project dependencies before adding external font dependencies.

If using external fonts, ensure that loading behavior and licensing are appropriate.

Define a clear hierarchy for:

- Main page headings.
- Section headings.
- Subheadings.
- Body text.
- Supporting information.
- Labels.
- Buttons.
- Metadata.
- Navigation.

Maintain consistent spacing and line heights.

Avoid overly small text.

Avoid using excessive font weights, sizes, and decorative typography without a clear purpose.

Make important information easy to scan.

==================================================
25. ANIMATIONS AND INTERACTIONS
==================================================

Use animations only when they improve the experience.

Appropriate examples may include:

- Subtle hover feedback.
- Smooth menu transitions.
- Small entrance animations.
- Focus and active states.
- Loading transitions.
- Gallery interactions.
- Page transitions when supported and appropriate.

Avoid:

- Excessive parallax.
- Constant movement.
- Distracting background animations.
- Excessive glow effects.
- Unnecessary bouncing elements.
- Animations that delay access to content.
- Animations that make the interface feel like a generic AI-generated template.

Respect the user's reduced-motion preference.

Use CSS animations or lightweight tools where practical.

Ensure that core interactions remain functional when animations are disabled.

==================================================
26. CONTENT ACCURACY
==================================================

Use verified project information.

The existing website, repository assets, and approved requirements should be the primary sources of truth.

Do not invent:

- Fanbase statistics.
- Member counts.
- Historical milestones.
- Events.
- Schedules.
- News.
- Partnerships.
- Testimonials.
- Social media accounts.
- Official affiliations.
- API results.

Do not represent FritzyForce as officially affiliated with JKT48 unless that status is explicitly verified and authorized.

Preserve accurate existing content when it remains relevant.

Improve the presentation and organization without changing the underlying facts unnecessarily.

If content is missing, use an appropriate empty state or make the field manageable through the CMS.

Do not fill production pages with fake content simply to make them look complete.

==================================================
27. SEO AND SOCIAL SHARING
==================================================

Implement appropriate SEO features for the public website.

Depending on the application architecture and requirements, include:

- Page titles.
- Meta descriptions.
- Canonical URLs where appropriate.
- Open Graph metadata.
- Social-sharing images.
- Semantic HTML.
- Appropriate heading hierarchy.
- Sitemap.
- Robots directives.
- Structured data only when accurate and applicable.
- Readable URLs.
- Correct status codes.
- Useful not-found pages.

Use accurate metadata for each page.

Do not use identical titles and descriptions for every route.

Do not invent structured data or business information.

Protect private administrative routes and private content from unintended indexing.

Ensure that public pages remain accessible to search engines where appropriate.

==================================================
28. ACCESSIBILITY
==================================================

Follow practical accessibility best practices.

Ensure that:

- Interactive elements are keyboard accessible.
- Forms have appropriate labels.
- Images have meaningful alternative text where needed.
- Decorative images are handled appropriately.
- Text contrast is sufficient.
- Focus indicators are visible.
- Buttons and links have understandable labels.
- Dialogs and menus behave accessibly.
- Semantic HTML is used appropriately.
- Status messages are understandable.
- Reduced-motion preferences are respected.

Do not use color as the only way to communicate important information.

Verify the accessibility of the purple-and-white palette.

==================================================
29. ERROR HANDLING AND APPLICATION STATES
==================================================

Every significant interactive feature must handle its relevant states.

Implement appropriate:

- Loading states.
- Empty states.
- Error states.
- Success feedback.
- Validation messages.
- Permission-denied states.
- Not-found pages.
- API failure handling.
- Database failure handling.
- Upload failure handling.

Do not leave users staring at a blank page when a request fails.

Do not show raw stack traces or sensitive implementation details to users.

Use clear, concise, user-friendly messages.

Ensure that failure states follow the same purple-and-white design system.

==================================================
30. TESTING AND QUALITY ASSURANCE
==================================================

Before considering the project complete, perform the available checks.

At minimum, where supported by the existing project, run:

- Dependency installation or verification.
- Linting.
- Type checking.
- Unit tests.
- Integration tests.
- Production build.
- Relevant route checks.
- Database migration checks.
- Authentication and authorization checks.
- API integration checks.
- Responsive layout review.

Do not assume a test has passed without running it.

If a command cannot be run because of environment limitations, report that limitation explicitly.

Fix errors caused by the implementation before committing whenever possible.

Review for:

- Broken imports.
- Missing dependencies.
- TypeScript errors.
- Broken routes.
- Invalid environment configuration.
- Missing database tables.
- Inaccessible components.
- Unhandled exceptions.
- Incorrect API assumptions.
- Broken mobile navigation.
- Incomplete forms.
- Buttons with no actual functionality.
- Placeholder links.
- Mock data accidentally left in production.
- Unused components.
- Console errors.

Do not claim the project is production-ready if critical functionality remains broken.

==================================================
31. IMPLEMENTATION PHASES
==================================================

Follow this implementation process.

PHASE 1: REPOSITORY INSPECTION

- Verify the repository and current branch.
- Ensure the work is on `main`.
- Inspect the project structure.
- Inspect dependencies and framework versions.
- Inspect the deployment configuration.
- Inspect existing routes and components.
- Inspect the current working tree.
- Identify existing functionality that must be preserved.

PHASE 2: REQUIREMENTS ANALYSIS

- Open the existing website.
- Inspect both Google Sheets tabs.
- Compare old and new requirements.
- Identify all required pages.
- Identify all required features.
- Identify required data models and integrations.
- Create a complete internal implementation checklist.

PHASE 3: DESIGN SYSTEM

- Inspect the FritzyForce logo and existing assets.
- Establish the purple-and-white palette.
- Define reusable design tokens.
- Establish typography, spacing, borders, and component styles.
- Design the navigation and overall layout.
- Ensure the design system is consistent across public pages and the admin dashboard.

PHASE 4: APPLICATION ARCHITECTURE

- Confirm the existing or selected framework.
- Verify Cloudflare compatibility.
- Design the route structure.
- Design the data model where required.
- Configure storage where required.
- Establish authentication and authorization where required.
- Establish shared components and reusable utilities.

PHASE 5: PUBLIC WEBSITE IMPLEMENTATION

- Redesign the homepage.
- Redesign the Fritzy profile.
- Redesign the fanbase profile and About Us.
- Implement required schedule pages.
- Implement required news and gallery pages.
- Implement every other feature identified in the spreadsheet.
- Ensure all public pages use the same design system.

PHASE 6: ADMINISTRATION AND DATA

- Implement the admin dashboard if required.
- Implement actual CRUD operations for required content.
- Implement authentication and authorization.
- Implement database integration.
- Implement image uploads and persistent storage where required.
- Connect external APIs only when specified and documented.

PHASE 7: RESPONSIVENESS AND ACCESSIBILITY

- Review every page on mobile.
- Review tablet and desktop layouts.
- Fix overflow and spacing issues.
- Verify navigation and interactions.
- Check contrast and keyboard accessibility.
- Verify reduced-motion behavior.

PHASE 8: TESTING AND FIXES

- Run linting.
- Run type checking.
- Run tests.
- Run the production build.
- Verify critical functionality.
- Fix implementation-related errors.
- Review the final changes.

PHASE 9: GITHUB COMMIT AND PUSH

- Confirm the active branch is `main`.
- Review the changed files.
- Commit changes directly to `main`.
- Push directly to remote `main` if permissions allow.
- Verify that the push succeeded.
- Never force-push.
- Never create another branch as a workaround.

PHASE 10: FINAL REPORT

Provide an accurate implementation report in Indonesian.

==================================================
32. FINAL ACCEPTANCE CRITERIA
==================================================

The project is complete only when the following criteria have been addressed.

REQUIREMENTS:

- The existing website has been inspected.
- Both relevant Google Sheets tabs have been reviewed, or access limitations have been documented.
- Requirements from the team have been incorporated.
- All identified required pages and features have been addressed.
- The project is not limited to the About Us page or fanbase profile page.

DESIGN:

- The entire website has been redesigned consistently.
- Purple and white are the primary brand colors.
- Existing brand assets have been considered.
- The design is professional, cohesive, and responsive.
- The design does not look like a generic AI-generated template.
- Visual effects are restrained and purposeful.

FUNCTIONALITY:

- Required pages are implemented.
- Required interactions work.
- Forms perform actual operations where required.
- Data is connected to the appropriate source.
- Required administrative functions work.
- Authentication and authorization are implemented when required.
- Required integrations use documented contracts.
- Loading, empty, success, and error states are handled appropriately.

TECHNICAL QUALITY:

- The application uses a maintainable architecture.
- TypeScript and lint checks pass where configured and supported.
- The production build passes, or any blocker is documented.
- Cloudflare compatibility has been verified against the chosen architecture.
- Database and storage requirements are implemented appropriately.
- No real secrets are committed.
- No critical implementation errors remain unaddressed.

GITHUB:

- All implementation work is performed on `main`.
- No new branch is created.
- Changes are committed directly to `main` when permitted.
- Changes are pushed directly to remote `main` when permitted.
- No force-push is performed.
- Commit and push results are reported accurately.

TRANSPARENCY:

- No feature is claimed to work unless it has been implemented.
- No test is claimed to pass unless it has been run.
- No deployment is claimed to succeed unless it has been verified.
- Missing credentials and external access limitations are documented.
- Unresolved issues are clearly identified.

==================================================
33. FINAL REPORT FORMAT
==================================================

When implementation is complete, provide a concise but informative report in Indonesian.

Use the following structure:

1. RINGKASAN
   Explain what was redesigned and implemented.

2. HALAMAN DAN FITUR
   List the pages and features that were actually completed.

3. DESAIN
   Explain the purple-and-white design system and the major UI improvements.

4. BACKEND DAN INTEGRASI
   Describe the database, authentication, storage, and API integrations that were actually implemented.

5. CLOUDFLARE
   Explain the selected deployment architecture and the compatibility checks performed.

6. TESTING
   List the commands and tests that were actually executed, including their results.

7. GITHUB
   State:
   - Final branch.
   - Commit hash, if committed.
   - Whether pushing to remote `main` succeeded.
   - Any permission or repository-protection limitation.

8. REMAINING ISSUES
   List unresolved issues, missing credentials, inaccessible requirements, or other blockers.

9. DEPLOYMENT INSTRUCTIONS
   Provide the actual steps required to configure and deploy the application, including required environment variables and Cloudflare bindings where applicable.

Do not provide a report that merely repeats the plan.

Report actual implementation results.

==================================================
34. FINAL EXECUTION INSTRUCTIONS
==================================================

START BY INSPECTING THE EXISTING GITHUB REPOSITORY AND VERIFYING
THAT THE ACTIVE BRANCH IS `main`.

THEN inspect the existing FritzyForce website and both Google Sheets
tabs before finalizing the implementation plan.

After requirements discovery, proceed with implementation.

Do not stop after writing a plan.

Do not stop after generating a design concept.

Do not stop after creating the homepage.

Do not implement only the fanbase profile or About Us page.

Do not ask the user to manually create files that you can create
within the connected repository environment.

Do not replace the entire repository blindly.

Preserve relevant existing functionality while implementing the
required redesign.

Follow the actual spreadsheet requirements rather than inventing
features.

Use purple and white as the primary brand colors throughout the
website.

Ensure Cloudflare deployment compatibility.

Perform all Git work on the existing `main` branch.

Commit and push directly to `main` when the environment and
permissions allow it.

If an operation is blocked, report the exact limitation instead
of pretending it succeeded or switching branches.

Your objective is to deliver the best complete, functional,
maintainable, and production-oriented FritzyForce website that
can be implemented within the available repository and execution
environment.

BEGIN WITH REPOSITORY INSPECTION. THEN IMPLEMENT THE PROJECT.
