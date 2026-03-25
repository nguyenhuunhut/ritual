const CLIENT_ID = "1486210210950549604";
const GUILD_ID = "1210468736205852672";
const REDIRECT_URI =
  window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname === "0.0.0.0"
    ? window.location.origin + window.location.pathname
    : "https://ritual.gjunn.xyz/";

debugger

const ROLE_IDS = {
  MOD: "1218322564573822986",
  RadiantRitualist: "1430908117331218442",
  Zealot: "1381749541581099069",
  Ritualits: "1339006464139984906",
  Ritty: "1430904963340566661",
  Bitty: "1430904348757725325",
  Forerunner: "1339080087558950922",
  Blessed: "1311411636367527976",
  Cursed: "1311411908351365232",
  Ascendant: "1349829585461706792",
  Iniatiate: "1212485735039508561",
  Community: "1350157558148497508",
};

const ROLE_TAGS = [
  { key: "MOD", label: "MOD", variant: "mod" },
  { key: "RadiantRitualist", label: "Radiant Ritualist", variant: "radiant" },
  { key: "Zealot", label: "Zealot", variant: "zealot" },
  { key: "Ritualits", label: "Ritualits", variant: "ritualits" },
  { key: "Ritty", label: "Ritty", variant: "ritty" },
  { key: "Bitty", label: "Bitty", variant: "bitty" },
  { key: "Forerunner", label: "Forerunner", variant: "forerunner" },
  { key: "Blessed", label: "Blessed", variant: "blessed" },
  { key: "Cursed", label: "Cursed", variant: "cursed" },
  { key: "Ascendant", label: "Ascendant", variant: "ascendant" },
  { key: "Iniatiate", label: "Iniatiate", variant: "iniatiate" },
  { key: "Community", label: "Community", variant: "community" },
];

const ROLE_ORDER = [
  "MOD",
  "RadiantRitualist",
  "Zealot",
  "Ritualits",
  "Ritty",
  "Bitty",
  "Forerunner",
  "Blessed",
  "Cursed",
  "Ascendant",
  "Iniatiate",
  "Community",
];
const ROLE_ACCENT = {
  MOD: "#ff4d4d",
  RadiantRitualist: "#f4c542",
  Zealot: "#7b5cff",
  Ritualits: "#32d66b",
  Ritty: "#a07bff",
  Bitty: "#4aa8ff",
  Forerunner: "#46c7ff",
  Blessed: "#f7c948",
  Cursed: "#5e4b8b",
  Ascendant: "#b8bcc6",
  Iniatiate: "#8fe27a",
  Community: "#3b82f6",
};
const ROLE_COPY = {
  MOD: {
    headline: "Ritual guardian.",
    body: "You keep the circle safe, structured, and aligned. Your presence is the rule of the ritual.",
    cta: "Hold the standard.",
  },
  RadiantRitualist: {
    headline: "Light of the circle.",
    body: "You radiate energy across the community. Your work keeps the ritual alive and visible.",
    cta: "Keep the flame bright.",
  },
  Zealot: {
    headline: "Relentless believer.",
    body: "Your conviction fuels momentum. You push the mission forward without hesitation.",
    cta: "Stay bold, stay loud.",
  },
  Ritualits: {
    headline: "Faithful builder.",
    body: "You show up consistently and move the ritual forward with steady action.",
    cta: "Keep the cadence.",
  },
  Ritty: {
    headline: "Rhythm keeper.",
    body: "You keep the vibe alive. Small signals from you keep the circle connected.",
    cta: "Keep the rhythm.",
  },
  Bitty: {
    headline: "Bright spark.",
    body: "You add quick bursts of energy that make the ritual feel alive and playful.",
    cta: "Keep the spark.",
  },
  Forerunner: {
    headline: "Path finder.",
    body: "You move ahead and set direction. Others follow the signals you set.",
    cta: "Lead the way.",
  },
  Blessed: {
    headline: "Chosen signal.",
    body: "You carry the favor of the circle. Your presence strengthens trust.",
    cta: "Stay aligned.",
  },
  Cursed: {
    headline: "Shadow bearer.",
    body: "You hold the dark edge and keep balance in the ritual’s orbit.",
    cta: "Keep the balance.",
  },
  Ascendant: {
    headline: "Rising force.",
    body: "You are climbing fast with undeniable impact. The ritual is watching.",
    cta: "Ascend higher.",
  },
  Iniatiate: {
    headline: "First steps.",
    body: "You are newly entered and learning the ritual. Every journey begins here.",
    cta: "Observe, learn, grow.",
  },
  Community: {
    headline: "Circle member.",
    body: "You are part of the ritual community and help keep the energy moving.",
    cta: "Stay close to the circle.",
  },
};
const DEFAULT_AVATAR = "https://ui-avatars.com/api/?name=Ritual&background=2a2410&color=f6d36b&size=256";
const BANNER_LOGO_URL = "assets/logo.png";
const SIDE_IMAGE_URL = "assets/v.png";
const CANVAS_FONT = '"Sora","Space Grotesk","Segoe UI",sans-serif';
const CONTRIBUTION_CHANNELS = {
  tweets: "1356603029268201595",
  memes: "1356603252925530282",
  arts: "1409550456174149842",
};

const loginBtn = document.getElementById("loginBtn");
const downloadBtn = document.getElementById("downloadBtn");
const logoutBtn = document.getElementById("logoutBtn");
const statusEl = document.getElementById("status");
const topAvatarEl = document.getElementById("topAvatar");
const topUsernameEl = document.getElementById("topUsername");
const preConnectCardEl = document.getElementById("preConnectCard");
const connectedBarEl = document.getElementById("connectedBar");
const cardWrapEl = document.getElementById("cardWrap");
const canvas = document.getElementById("roleCard");
const ctx = canvas.getContext("2d");

let currentProfile = null;
let tokenData = null;
let renderNonce = 0;

init();

async function init() {
  const guestProfile = createGuestProfile();
  renderCard(guestProfile);
  renderTopIdentity(guestProfile);
  setAuthState(false);

  const params = new URLSearchParams(window.location.search);
  const code = params.get("code");
  const state = params.get("state");

  if (code) {
    status("Authenticating with Discord...");
    try {
      await handleOAuthCallback(code, state);
      window.history.replaceState({}, document.title, REDIRECT_URI);
      await loadUserData();
    } catch (error) {
      console.error(error);
      status(`Login error: ${error.message}`);
    }
  }

  loginBtn.addEventListener("click", beginDiscordLogin);
  downloadBtn.addEventListener("click", downloadCard);
  logoutBtn.addEventListener("click", logout);
}

function beginDiscordLogin() {
  if (window.location.protocol === "file:") {
    status("Please open this page via http://localhost or https:// (file:// blocks Discord login).");
    return;
  }
  if (!window.isSecureContext || !crypto?.subtle || !crypto?.getRandomValues) {
    status("Discord login requires a secure context (https:// or localhost).");
    return;
  }
  if (!CLIENT_ID.startsWith("REPLACE") && !GUILD_ID.startsWith("REPLACE")) {
    // continue
  } else {
    status("Please update CLIENT_ID and GUILD_ID in app.js first.");
    return;
  }

  const state = randomString(24);
  const verifier = randomString(80);
  localStorage.setItem("discord_oauth_state", state);
  localStorage.setItem("discord_code_verifier", verifier);

  pkceChallenge(verifier)
    .then((challenge) => {
      const params = new URLSearchParams({
        response_type: "code",
        client_id: CLIENT_ID,
        scope: "identify guilds.members.read",
        state,
        redirect_uri: REDIRECT_URI,
        prompt: "consent",
        code_challenge: challenge,
        code_challenge_method: "S256",
      });
      window.location.href = `https://discord.com/oauth2/authorize?${params.toString()}`;
    })
    .catch((error) => {
      console.error(error);
      status("Unable to start Discord login. Please ensure HTTPS/localhost is used.");
    });
}

async function handleOAuthCallback(code, state) {
  const savedState = localStorage.getItem("discord_oauth_state");
  const codeVerifier = localStorage.getItem("discord_code_verifier");
  if (!savedState || savedState !== state) throw new Error("Invalid OAuth state.");
  if (!codeVerifier) throw new Error("Missing code verifier.");

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID,
    code_verifier: codeVerifier,
  });

  const tokenRes = await fetch("https://discord.com/api/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!tokenRes.ok) {
    throw new Error(`Failed to fetch access token (${tokenRes.status}).`);
  }

  tokenData = await tokenRes.json();
  sessionStorage.setItem("discord_token_data", JSON.stringify(tokenData));
  localStorage.removeItem("discord_oauth_state");
  localStorage.removeItem("discord_code_verifier");
}

async function loadUserData() {
  if (!tokenData) {
    const saved = sessionStorage.getItem("discord_token_data");
    if (saved) tokenData = JSON.parse(saved);
  }
  if (!tokenData?.access_token) {
    status("Not signed in.");
    return;
  }

  status("Loading account details...");

  const me = await discordFetch("/users/@me");
  const member = await discordFetch(`/users/@me/guilds/${GUILD_ID}/member`);
  const matchedRoles = detectMatchedRoles(member.roles || []);
  const role = detectMainRole(matchedRoles);
  const joinedDate = member.joined_at ? new Date(member.joined_at) : null;
  const contributionStats = (await fetchContributionStats(me.id).catch(() => null)) || {
    tweets: 0,
    memes: 0,
    arts: 0,
    total: 0,
  };

  currentProfile = {
    project: "Ritual",
    username: `${me.username}${me.discriminator && me.discriminator !== "0" ? "#" + me.discriminator : ""}`,
    displayName: me.global_name || me.username || "Member",
    handle: `@${me.username || "member"}`,
    language: formatLanguageLabel(navigator.language),
    role,
    joinedAt: joinedDate
      ? joinedDate.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
      : null,
    joinDays: joinedDate ? Math.max(0, Math.floor((Date.now() - joinedDate.getTime()) / 86400000)) : 0,
    avatarUrl: getAvatarUrl(me),
    matchedRoles,
    contributionStats,
    connected: true,
  };

  renderCard(currentProfile);
  renderTopIdentity(currentProfile);
  status(`Welcome ${currentProfile.username} - primary role: ${currentProfile.role}`);
  setAuthState(true);
  downloadBtn.disabled = false;
  logoutBtn.disabled = false;
}

async function discordFetch(path) {
  const res = await fetch(`https://discord.com/api${path}`, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
  });
  if (!res.ok) throw new Error(`Discord API error (${res.status}) at ${path}`);
  return res.json();
}

function createGuestProfile() {
  return {
    project: "Ritual",
    username: "Guest",
    displayName: "Guest",
    handle: "@connect-discord",
    language: "Not connected",
    role: "Community",
    joinedAt: null,
    joinDays: 0,
    avatarUrl: DEFAULT_AVATAR,
    matchedRoles: [],
    connected: false,
  };
}

function detectMatchedRoles(memberRoleIds) {
  const memberRoleSet = new Set((memberRoleIds || []).map((id) => normalizeRoleId(id)));
  const matched = ROLE_ORDER.filter((roleName) => {
    const roleId = normalizeRoleId(ROLE_IDS[roleName]);
    return roleId && !roleId.startsWith("REPLACE") && memberRoleSet.has(roleId);
  });

  // Debug helper: helps verify why a role is not highlighted after login.
  if (matched.length === 0) {
    console.warn("No configured ROLE_IDS matched user roles.", {
      memberRoles: [...memberRoleSet],
      configuredRoleIds: Object.fromEntries(
        Object.entries(ROLE_IDS).map(([key, value]) => [key, normalizeRoleId(value)])
      ),
    });
  }

  return matched;
}

function detectMainRole(matchedRoles) {
  for (const roleName of ROLE_ORDER) {
    if (matchedRoles.includes(roleName)) return roleName;
  }
  return "Community";
}

function normalizeRoleId(roleId) {
  return String(roleId || "").trim();
}

async function fetchContributionStats(userId) {
  const apiBase = window.RITUAL_STATS_API;
  if (!apiBase) return null;
  const base = apiBase.replace(/\/+$/, "");
  const params = new URLSearchParams({
    guild_id: GUILD_ID,
    user_id: userId,
    tweets_channel_id: CONTRIBUTION_CHANNELS.tweets,
    memes_channel_id: CONTRIBUTION_CHANNELS.memes,
    arts_channel_id: CONTRIBUTION_CHANNELS.arts,
  });
  const res = await fetch(`${base}/contributions?${params.toString()}`);
  if (!res.ok) return null;
  const data = await res.json();
  const tweets = Number(data.tweets) || 0;
  const memes = Number(data.memes) || 0;
  const arts = Number(data.arts) || 0;
  return { tweets, memes, arts, total: tweets + memes + arts };
}

function getAvatarUrl(me) {
  if (!me?.id) return DEFAULT_AVATAR;
  if (me.avatar) {
    const ext = me.avatar.startsWith("a_") ? "gif" : "png";
    return `https://cdn.discordapp.com/avatars/${me.id}/${me.avatar}.${ext}?size=256`;
  }
  const index = Number(me.discriminator || "0") % 5;
  return `https://cdn.discordapp.com/embed/avatars/${index}.png`;
}

function formatLanguageLabel(locale) {
  if (!locale) return "Connected";
  if (locale.toLowerCase().startsWith("vi")) return "Vietnamese";
  if (locale.toLowerCase().startsWith("en")) return "English";
  return locale.toUpperCase();
}

function isLocalHost() {
  return (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1" ||
    window.location.hostname === "0.0.0.0"
  );
}

function renderCard(profile) {
  const drawId = ++renderNonce;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const bg = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  bg.addColorStop(0, "#0a0f0d");
  bg.addColorStop(0.45, "#0f1512");
  bg.addColorStop(1, "#0a0d0b");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const beam = ctx.createLinearGradient(0, 120, canvas.width, 680);
  beam.addColorStop(0, "rgba(57, 242, 171, 0)");
  beam.addColorStop(0.5, "rgba(57, 242, 171, 0.18)");
  beam.addColorStop(1, "rgba(57, 242, 171, 0)");
  ctx.save();
  ctx.translate(0, -120);
  ctx.rotate((-6 * Math.PI) / 180);
  ctx.fillStyle = beam;
  ctx.fillRect(-200, 160, canvas.width + 400, 260);
  ctx.restore();

  const glowA = ctx.createRadialGradient(220, 180, 40, 220, 180, 520);
  glowA.addColorStop(0, "rgba(57, 242, 171, 0.2)");
  glowA.addColorStop(1, "rgba(57, 242, 171, 0)");
  ctx.fillStyle = glowA;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const glowB = ctx.createRadialGradient(980, 1040, 60, 980, 1040, 560);
  glowB.addColorStop(0, "rgba(255, 122, 47, 0.2)");
  glowB.addColorStop(1, "rgba(255, 122, 47, 0)");
  ctx.fillStyle = glowB;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const frameX = 24;
  const frameY = 24;
  const frameW = canvas.width - 48;
  const frameH = canvas.height - 48;
  roundedRect(ctx, frameX, frameY, frameW, frameH, 26);
  ctx.fillStyle = "rgba(236, 255, 244, 0.02)";
  ctx.fill();
  ctx.strokeStyle = "rgba(57, 242, 171, 0.22)";
  ctx.lineWidth = 2.5;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(frameX + frameW - 180, frameY + 18);
  ctx.lineTo(frameX + frameW - 20, frameY + 18);
  ctx.lineTo(frameX + frameW - 20, frameY + 58);
  ctx.closePath();
  ctx.fillStyle = "rgba(57, 242, 171, 0.18)";
  ctx.fill();
  ctx.restore();

  drawHeader(profile);
  drawRoleTags(profile);
  drawLearnBanner(drawId);
  drawStats(profile, drawId);

  if (profile.avatarUrl) {
    drawAvatar(profile.avatarUrl, drawId);
  }
}

function drawHeader(profile) {
  const avatarX = 70;
  const avatarY = 82;
  const avatarSize = 156;

  ctx.save();
  roundedRect(ctx, avatarX - 6, avatarY - 6, avatarSize + 12, avatarSize + 12, 28);
  const frame = ctx.createLinearGradient(avatarX - 6, avatarY - 6, avatarX + avatarSize + 6, avatarY + avatarSize + 6);
  frame.addColorStop(0, "rgba(57, 242, 171, 0.55)");
  frame.addColorStop(1, "rgba(255, 122, 47, 0.45)");
  ctx.fillStyle = frame;
  ctx.fill();
  roundedRect(ctx, avatarX, avatarY, avatarSize, avatarSize, 22);
  ctx.fillStyle = "#ecfff4";
  ctx.fill();
  ctx.restore();

  ctx.fillStyle = "#08110d";
  ctx.font = `700 56px ${CANVAS_FONT}`;
  ctx.fillText("?", avatarX + 66, avatarY + 100);

  const nameGlow = ctx.createLinearGradient(260, 100, 720, 170);
  nameGlow.addColorStop(0, "#ecfff4");
  nameGlow.addColorStop(0.55, "#baf9de");
  nameGlow.addColorStop(1, "#ffdfb4");
  ctx.fillStyle = nameGlow;
  ctx.font = `700 60px ${CANVAS_FONT}`;
  ctx.fillText(profile.displayName, 260, 140);

  ctx.fillStyle = "#c3d7cc";
  ctx.font = `500 36px ${CANVAS_FONT}`;
  ctx.fillText(profile.handle, 260, 192);

  const meta = profile.joinedAt ? `Joined ${profile.joinedAt}` : "Joined pending";
  const metaW = ctx.measureText(meta).width + 50;
  roundedRect(ctx, 260, 210, metaW, 40, 20);
  ctx.fillStyle = "rgba(57, 242, 171, 0.1)";
  ctx.fill();
  ctx.strokeStyle = "rgba(57, 242, 171, 0.35)";
  ctx.lineWidth = 1.6;
  ctx.stroke();
  ctx.fillStyle = "#bfe8d6";
  ctx.font = `500 24px ${CANVAS_FONT}`;
  ctx.fillText(meta, 282, 238);
}

function drawRoleTags(profile) {
  const tags = ROLE_TAGS.map((tag) => {
    if (profile.matchedRoles.includes(tag.key)) {
      return tag;
    }
    return { ...tag, variant: profile.connected ? "muted" : "neutral" };
  });

  ctx.font = `700 30px ${CANVAS_FONT}`;

  let x = 60;
  let y = 304;
  for (const item of tags) {
    const w = Math.max(120, ctx.measureText(item.label).width + 62);
    if (x + w > canvas.width - 60) {
      x = 60;
      y += 68;
    }
    drawTag(x, y, w, 46, item.label, item.variant);
    x += w + 12;
  }
}

function drawLearnBanner(drawId) {
  const x = 54;
  const y = 570;
  const w = canvas.width - 108;
  const h = 150;
  roundedRect(ctx, x, y, w, h, 26);
  const banner = ctx.createLinearGradient(x, y, x + w, y + h);
  banner.addColorStop(0, "rgba(57, 242, 171, 0.16)");
  banner.addColorStop(0.5, "rgba(12, 16, 14, 0.05)");
  banner.addColorStop(1, "rgba(255, 122, 47, 0.18)");
  ctx.fillStyle = banner;
  ctx.fill();
  ctx.strokeStyle = "rgba(57, 242, 171, 0.45)";
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  ctx.beginPath();
  ctx.moveTo(x + 24, y + 24);
  ctx.lineTo(x + 240, y + 24);
  ctx.lineTo(x + 214, y + 52);
  ctx.lineTo(x + 24, y + 52);
  ctx.closePath();
  ctx.fillStyle = "rgba(57, 242, 171, 0.22)";
  ctx.fill();
  ctx.restore();

  drawBannerLogo(drawId, x + 30, y + 56, 260, 90);

  ctx.fillStyle = "#dbf4e6";
  ctx.font = `600 30px ${CANVAS_FONT}`;
  ctx.fillText("Your contributions are seen and valued.", x + 320, y + 88);
  ctx.fillStyle = "#a8c8ba";
  ctx.font = `500 24px ${CANVAS_FONT}`;
  ctx.fillText("Thank you for shaping the Ritual community.", x + 320, y + 126);
}

function drawBannerLogo(drawId, x, y, maxW, maxH) {
  const img = new Image();
  img.onload = () => {
    if (drawId !== renderNonce) return;
    const ratio = img.naturalWidth / img.naturalHeight;
    let drawW = maxW;
    let drawH = drawW / ratio;
    if (drawH > maxH) {
      drawH = maxH;
      drawW = drawH * ratio;
    }
    const drawX = x + (maxW - drawW) / 2;
    const drawY = y + (maxH - drawH) / 2;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  };
  img.src = BANNER_LOGO_URL;
}

function drawStats(profile, drawId) {
  const panelX = 54;
  const panelY = 742;
  const panelW = canvas.width - 108;
  const panelH = 452;
  roundedRect(ctx, panelX, panelY, panelW, panelH, 28);
  ctx.fillStyle = "rgba(236, 255, 244, 0.02)";
  ctx.fill();
  ctx.strokeStyle = "rgba(57, 242, 171, 0.24)";
  ctx.lineWidth = 2;
  ctx.stroke();

  const splitX = panelX + 330;
  ctx.beginPath();
  ctx.moveTo(splitX, panelY + 24);
  ctx.lineTo(splitX, panelY + panelH - 24);
  ctx.strokeStyle = "rgba(57, 242, 171, 0.18)";
  ctx.lineWidth = 1.5;
  ctx.stroke();

  const roleName = ROLE_COPY[profile.role] ? profile.role : "Community";
  const info = ROLE_COPY[roleName];
  const accent = ROLE_ACCENT[roleName] || "#50b3ff";
  const contentX = splitX + 36;
  const contentY = panelY + 110;
  const contentW = panelW - (contentX - panelX) - 36;


  ctx.fillStyle = accent;
  ctx.font = `700 58px ${CANVAS_FONT}`;
  ctx.fillText(roleName, contentX, contentY);

  ctx.fillStyle = "#ecfff4";
  ctx.font = `600 34px ${CANVAS_FONT}`;
  ctx.fillText(info.headline, contentX, contentY + 60);

  ctx.fillStyle = "#c0d7cc";
  ctx.font = `500 28px ${CANVAS_FONT}`;
  drawWrappedText(info.body, contentX, contentY + 108, contentW, 40);

  ctx.font = `700 30px ${CANVAS_FONT}`;
  const ctaWidth = Math.min(contentW, ctx.measureText(info.cta).width + 56);
  drawPill(contentX, panelY + panelH - 84, ctaWidth, 48, info.cta, {
    bg: "rgba(57, 242, 171, 0.18)",
    border: "rgba(57, 242, 171, 0.55)",
    text: "#c9ffe3",
  });

  const img = new Image();
  img.onload = () => {
    if (drawId !== renderNonce) return;
    const boxX = panelX + 36;
    const boxY = panelY + 70;
    const boxW = 250;
    const boxH = panelH - 120;
    roundedRect(ctx, boxX, boxY, boxW, boxH, 22);
    ctx.fillStyle = "rgba(12, 16, 14, 0.55)";
    ctx.fill();
    ctx.strokeStyle = "rgba(57, 242, 171, 0.22)";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    const ratio = img.naturalWidth / img.naturalHeight;
    let drawW = boxW - 26;
    let drawH = drawW / ratio;
    if (drawH > boxH - 26) {
      drawH = boxH - 26;
      drawW = drawH * ratio;
    }
    const drawX = boxX + (boxW - drawW) / 2;
    const drawY = boxY + (boxH - drawH) / 2;
    ctx.drawImage(img, drawX, drawY, drawW, drawH);
  };
  img.src = SIDE_IMAGE_URL;
}

function drawTag(x, y, w, h, label, variant) {
  const variants = {
    neutral: { bg: "rgba(239, 239, 239, 0.02)", border: "rgba(239, 239, 239, 0.18)", text: "#bcb9c7" },
    mod: { bg: "rgba(255, 77, 77, 0.2)", border: "rgba(255, 77, 77, 0.6)", text: "#ffb0b0" },
    radiant: { bg: "rgba(244, 197, 66, 0.2)", border: "rgba(244, 197, 66, 0.6)", text: "#ffe19a" },
    zealot: { bg: "rgba(123, 92, 255, 0.2)", border: "rgba(123, 92, 255, 0.6)", text: "#c9b7ff" },
    ritualits: { bg: "rgba(50, 214, 107, 0.2)", border: "rgba(50, 214, 107, 0.6)", text: "#9ff0c0" },
    ritty: { bg: "rgba(160, 123, 255, 0.2)", border: "rgba(160, 123, 255, 0.6)", text: "#d9c8ff" },
    bitty: { bg: "rgba(74, 168, 255, 0.2)", border: "rgba(74, 168, 255, 0.6)", text: "#b7dcff" },
    forerunner: { bg: "rgba(70, 199, 255, 0.2)", border: "rgba(70, 199, 255, 0.6)", text: "#b9ecff" },
    blessed: { bg: "rgba(247, 201, 72, 0.2)", border: "rgba(247, 201, 72, 0.6)", text: "#ffe3a4" },
    cursed: { bg: "rgba(94, 75, 139, 0.2)", border: "rgba(94, 75, 139, 0.6)", text: "#c6b8e8" },
    ascendant: { bg: "rgba(184, 188, 198, 0.2)", border: "rgba(184, 188, 198, 0.6)", text: "#e2e5ec" },
    iniatiate: { bg: "rgba(143, 226, 122, 0.2)", border: "rgba(143, 226, 122, 0.6)", text: "#c8f4b8" },
    community: { bg: "rgba(59, 130, 246, 0.2)", border: "rgba(59, 130, 246, 0.6)", text: "#b9d5ff" },
    active: { bg: "rgba(239, 239, 239, 0.12)", border: "rgba(239, 239, 239, 0.3)", text: "#efefef" },
    muted: { bg: "rgba(239, 239, 239, 0.01)", border: "rgba(239, 239, 239, 0.12)", text: "rgba(189, 185, 198, 0.58)" },
    default: { bg: "rgba(239, 239, 239, 0.02)", border: "rgba(239, 239, 239, 0.16)", text: "#bebacc" },
  };
  const style = variants[variant] || variants.default;
  drawPill(x, y, w, h, label, style);
}

function drawPill(x, y, w, h, label, style) {
  roundedRect(ctx, x, y, w, h, h / 2);
  ctx.fillStyle = style.bg;
  ctx.fill();
  ctx.strokeStyle = style.border;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = style.text;
  ctx.font = `700 30px ${CANVAS_FONT}`;
  ctx.fillText(label, x + 18, y + 33);
}

function drawWrappedText(text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let lineY = y;

  for (const word of words) {
    const testLine = line ? `${line} ${word}` : word;
    if (ctx.measureText(testLine).width > maxWidth && line) {
      ctx.fillText(line, x, lineY);
      line = word;
      lineY += lineHeight;
    } else {
      line = testLine;
    }
  }

  if (line) ctx.fillText(line, x, lineY);
}

function drawAvatar(url, drawId) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.onload = () => {
    if (drawId !== renderNonce) return;
    const x = 70;
    const y = 82;
    const size = 156;
    ctx.save();
    ctx.beginPath();
    ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(img, x, y, size, size);
    ctx.restore();
  };
  img.src = url;
}

function roundedRect(context, x, y, w, h, r) {
  context.beginPath();
  context.moveTo(x + r, y);
  context.arcTo(x + w, y, x + w, y + h, r);
  context.arcTo(x + w, y + h, x, y + h, r);
  context.arcTo(x, y + h, x, y, r);
  context.arcTo(x, y, x + w, y, r);
  context.closePath();
}

function downloadCard() {
  const link = document.createElement("a");
  const safeName = (currentProfile?.username || "ritual-user").replace(/[^a-z0-9]/gi, "_").toLowerCase();
  link.download = `ritual-role-card-${safeName}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}

function logout() {
  sessionStorage.removeItem("discord_token_data");
  tokenData = null;
  currentProfile = null;
  downloadBtn.disabled = true;
  logoutBtn.disabled = true;
  const guestProfile = createGuestProfile();
  renderCard(guestProfile);
  renderTopIdentity(guestProfile);
  status("Signed out locally from the website.");
  setAuthState(false);
}

function renderTopIdentity(profile) {
  if (!topAvatarEl || !topUsernameEl) return;
  topAvatarEl.src = profile.avatarUrl || DEFAULT_AVATAR;
  topUsernameEl.textContent = profile.connected ? profile.handle.replace(/^@/, "") : "guest";
}

function setAuthState(connected) {
  if (preConnectCardEl) preConnectCardEl.classList.toggle("hidden", connected);
  if (connectedBarEl) connectedBarEl.classList.toggle("hidden", !connected);
  if (cardWrapEl) cardWrapEl.classList.toggle("hidden", !connected);
}

function status(message) {
  if (statusEl) statusEl.textContent = message;
}

function randomString(len) {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let out = "";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  for (const n of arr) out += chars[n % chars.length];
  return out;
}

async function pkceChallenge(verifier) {
  const encoded = new TextEncoder().encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", encoded);
  return btoa(String.fromCharCode(...new Uint8Array(digest)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}
