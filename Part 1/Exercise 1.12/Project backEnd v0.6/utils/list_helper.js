const dummy = (blogs) => {
  return 1
}



const totalLikes = (blogs) => {
  return blogs.reduce((sum, blog) => sum + blog.likes, 0)
}


const favoriteBlog = (blogs) => {
  const favorite = blogs.reduce((prev, current) => {
    return (prev.likes > current.likes) ? prev : current
  })
  return favorite
}

const mostBlogs = (blogs) => {
  const authorCounts = {};
  blogs.forEach(blog => {
    if (authorCounts[blog.author]) {
      authorCounts[blog.author] += 1;
    } else {
      authorCounts[blog.author] = 1;
    }
  });

  let maxBlogs = 0;
  let authorWithMostBlogs = '';
  for (const author in authorCounts) {
    if (authorCounts[author] > maxBlogs) {
      maxBlogs = authorCounts[author];
      authorWithMostBlogs = author;
    }
  }

  return { author: authorWithMostBlogs, blogs: maxBlogs };
}

const mostLikes = (blogs) => {
  const authorLikes = {};
  blogs.forEach(blog => {
    if (authorLikes[blog.author]) {
      authorLikes[blog.author] += blog.likes;
    } else {
      authorLikes[blog.author] = blog.likes;
    }
  });

  let maxLikes = 0;
  let authorWithMostLikes = '';
  for (const author in authorLikes) {
    if (authorLikes[author] > maxLikes) {
      maxLikes = authorLikes[author];
      authorWithMostLikes = author;
    }
  }

  return { author: authorWithMostLikes, likes: maxLikes };
}


module.exports = {
  dummy, totalLikes, favoriteBlog, mostBlogs, mostLikes
}

