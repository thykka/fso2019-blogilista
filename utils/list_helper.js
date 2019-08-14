const dummy = blogs => {
  return 1;
};

const totalLikes = (blogs = []) => {
  return blogs.reduce((total, { likes }) => total + likes, 0);
};

const favoriteBlog = (blogs = []) => {
  return blogs.sort((blogA, blogB) => blogB.likes - blogA.likes)[0];
};

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog
};
