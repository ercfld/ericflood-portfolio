import { social } from '../data.js';

export function renderBio() {
  return `
    <div class="text-page">
      <h1>Biography</h1>
      <p>
        Eric was born in rural North Carolina. Though Eric studied design alongside
        development economics, he did not pick up a camera until 2021. He is interested
        in documentary photography, exploring social issues and other cultures through
        language, religion, and daily practices and rituals.
      </p>
      <p>
        Eric firmly believes in the power of story-telling and the idea that every
        person and place has a unique narrative to uncover. In his experience, photography
        is a way to move through and shape the world, co-creating narrative outputs with
        those in the images. However, Eric&rsquo;s photos are unstaged and raw, with a sense
        of closeness to subjects.
      </p>
      <p>
        When Eric is not making photographs, he works as a management consultant in
        New York City, focusing on food and agriculture with a passion for economic
        development work. He has managed to travel quite a bit for someone from the
        backwoods of North Carolina and is experienced in working across cultures and
        getting into and out of tight spots.
      </p>

      <div class="contact-callout">
        <p>For inquiries about prints, exhibitions, licensing, or collaborations:</p>
        <p><a href="mailto:ercfld@gmail.com">ercfld@gmail.com</a></p>
      </div>

      <div class="instagram-section">
        <a href="${social.instagram.url}" class="instagram-cta" target="_blank" rel="noopener">
          Check out my Instagram feed for updates
        </a>
        <div class="instagram-feed-container">
          <behold-widget feed-id="qNkYikWTJkFNzdTZ0fAN"></behold-widget>
        </div>
      </div>
    </div>
  `;
}

export function initBio() {
  // Behold widget auto-initializes via the script in index.html
}
