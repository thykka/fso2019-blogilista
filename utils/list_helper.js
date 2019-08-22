const dummy = blogs => {
  return (blogs, 1);
};

const totalLikes = (blogs = []) => {
  return blogs.reduce((total, { likes }) => total + likes, 0);
};

const favoriteBlog = (blogs = []) => {
  return blogs.sort((blogA, blogB) => blogB.likes - blogA.likes)[0];
};

const countAuthorsBlogs = (blogs = []) => {
  return blogs.reduce((totals, { author }) => {
    if(typeof totals[author] === 'undefined') {
      totals[author] = 1;
    } else {
      totals[author]++;
    }
    return totals;
  }, {});
};

const mostBlogs = (blogs = []) => {
  const authorBlogCounts = countAuthorsBlogs(blogs);
  const [author, blogCount] = Object.entries(authorBlogCounts).sort(
    ([_, countA], [__, countB]) => countB - countA
  )[0];
  return {
    author, blogs: blogCount
  };
};

const countAuthorsLikes = (blogs = []) => {
  return blogs.reduce((totals, { author, likes }) => {
    if(typeof totals[author] === 'undefined') {
      totals[author] = likes;
    } else {
      totals[author] += likes;
    }
    return totals;
  }, {});
};

const mostLikes = (blogs = []) => {
  const authorLikesCounts = countAuthorsLikes(blogs);
  const [author, likes] = Object.entries(authorLikesCounts).sort(
    ([_, likesA], [__, likesB]) => likesB - likesA
  )[0];
  return {
    author, likes
  };
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  countAuthorsBlogs,
  mostBlogs,
  countAuthorsLikes,
  mostLikes
};
