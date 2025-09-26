const express = require("express");
const router = express.Router();
const { TwitterApi } = require("twitter-api-v2");
const SocialProfile = require("../models/SocialProfile");
const { auth } = require("../middleware/auth");

// Initialize Twitter client
const twitterClient = new TwitterApi({
  clientId: process.env.TWITTER_CLIENT_ID,
  clientSecret: process.env.TWITTER_CLIENT_SECRET,
});

// @route   GET /api/twitter-auth/callback
// @desc    Callback URL for Twitter OAuth 2.0
// @access  Public
router.get("/callback", auth, async (req, res) => {
  const { code, state } = req.query;
  const { codeVerifier, state: sessionState } = req.session;

  if (!codeVerifier || !state || !sessionState || !code) {
    return res.status(400).send("You denied the app or your session expired!");
  }
  if (state !== sessionState) {
    return res.status(400).send("Stored tokens didn\'t match!");
  }

  try {
    const { accessToken, refreshToken, expiresIn } = await twitterClient.loginWithOAuth2({
      code,
      codeVerifier,
      redirectUri: process.env.TWITTER_CALLBACK_URL,
    });

    const { data: userObject } = await new TwitterApi(accessToken).v2.me();

    let socialProfile = await SocialProfile.findOne({
      platform: "twitter",
      profileId: userObject.id,
      userId: req.user.id,
    });

    if (socialProfile) {
      socialProfile.accessToken = accessToken;
      socialProfile.refreshToken = refreshToken;
      socialProfile.expiresIn = expiresIn;
      socialProfile.username = userObject.username;
      socialProfile.displayName = userObject.name;
      socialProfile.profileImageUrl = userObject.profile_image_url;
      socialProfile.isActive = true;
    } else {
      socialProfile = new SocialProfile({
        userId: req.user.id,
        platform: "twitter",
        profileId: userObject.id,
        username: userObject.username,
        displayName: userObject.name,
        profileImageUrl: userObject.profile_image_url,
        accessToken,
        refreshToken,
        expiresIn,
        isActive: true,
      });
    }

    await socialProfile.save();

    res.send("Twitter account connected successfully!");
  } catch (error) {
    console.error("Twitter OAuth Error:", error);
    res.status(500).send("Failed to connect Twitter account.");
  }
});

module.exports = router;
