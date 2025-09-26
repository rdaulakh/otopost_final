const asyncHandler = require('express-async-handler');
const Post = require('../models/postModel');

const saveBatchPosts = asyncHandler(async (req, res) => {
    const posts = req.body.posts;
    if (!posts || !Array.isArray(posts)) {
        res.status(400);
        throw new Error('Invalid request: "posts" array is required.');
    }

    const postsToSave = posts.map(post => ({
        ...post,
        user: req.user.id,
        status: 'pending'
    }));

    const createdPosts = await Post.insertMany(postsToSave);
    res.status(201).json(createdPosts);
});

const approvePost = asyncHandler(async (req, res) => {
    const post = await Post.findById(req.params.id);

    if (!post) {
        res.status(404);
        throw new Error('Post not found');
    }

    if (!req.user) {
        res.status(401);
        throw new Error('User not found');
    }

    if (post.user.toString() !== req.user.id) {
        res.status(401);
        throw new Error('User not authorized');
    }

    post.status = 'approved';
    const updatedPost = await post.save();

    res.status(200).json(updatedPost);
});


module.exports = {
    saveBatchPosts,
    approvePost,
};
