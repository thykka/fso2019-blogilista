const listHelper = require('../utils/list_helper');

const listWithManyBlogs = [
  {
    'title': 'Test blog',
    'author': 'thykka',
    'url': 'http://example.com',
    'likes': 0
  },
  {
    'title': 'Test blog 2',
    'author': 'thykka',
    'url': 'http://example.com',
    'likes': 3
  },
  {
    'title': 'React patterns',
    'author': 'Michael Chan',
    'url': 'https://reactpatterns.com/',
    'likes': 7
  },
  {
    'title': 'Go To Statement Considered Harmful',
    'author': 'Edsger W. Dijkstra',
    'url': 'http://www.u.arizona.edu/~rubinson/copyright_violations/Go_To_Considered_Harmful.html',
    'likes': 5
  },
  {
    'title': 'Canonical string reduction',
    'author': 'Edsger W. Dijkstra',
    'url': 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
    'likes': 12
  },
  {
    'title': 'First class tests',
    'author': 'Robert C. Martin',
    'url': 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
    'likes': 10
  },
  {
    'title': 'TDD harms architecture',
    'author': 'Robert C. Martin',
    'url': 'http://blog.cleancoder.com/uncle-bob/2017/03/03/TDD-Harms-Architecture.html',
    'likes': 0
  },
  {
    'title': 'Type wars',
    'author': 'Robert C. Martin',
    'url': 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html',
    'likes': 2
  }
];

const listWithOneBlog = [
  {
    'title': 'Test blog 2',
    'author': 'thykka',
    'url': 'http://example.com',
    'likes': 3
  }
];

describe('jest setup tests', () => {
  test('dummy returns one', () => {
    const blogs = [];

    const result = listHelper.dummy(blogs);

    expect(result).toBe(1);
  });
});

describe('totalLikes', () => {

  test('counts sum of likes in a list with one blog', () => {
    const result = listHelper.totalLikes(listWithOneBlog);
    expect(result).toBe(3);
  });

  test('counts sum of likes in a list with many blogs', () => {
    const result = listHelper.totalLikes(listWithManyBlogs);
    expect(result).toBe(39);
  });

  test('counts sum of likes in an empty list', () => {
    const result = listHelper.totalLikes([]);
    expect(result).toBe(0);
  });
});


describe('favoriteBlog', () => {

  test('given a list of blogs, returns the one with most likes', () => {
    const result = listHelper.favoriteBlog(listWithManyBlogs);
    expect(result).toEqual({
      'title': 'Canonical string reduction',
      'author': 'Edsger W. Dijkstra',
      'url': 'http://www.cs.utexas.edu/~EWD/transcriptions/EWD08xx/EWD808.html',
      'likes': 12
    });
  });
});

describe('countAuthorsBlogs', () => {
  test('given a list with one blog, returns the amount of blogs from each author', () => {
    const result = listHelper.countAuthorsBlogs(listWithOneBlog);
    expect(result).toEqual({
      'thykka': 1
    });
  });

  test('given a list of blogs, returns the amount of blogs from each author', () => {
    const result = listHelper.countAuthorsBlogs(listWithManyBlogs);
    expect(result).toEqual({
      'Edsger W. Dijkstra': 2,
      'Michael Chan': 1,
      'Robert C. Martin': 3,
      'thykka': 2
    });
  });
});

describe('mostBlogs', () => {
  test('given a list of blogs, returns the author with most blogs', () => {
    const result = listHelper.mostBlogs(listWithManyBlogs);
    expect(result).toEqual({
      author: 'Robert C. Martin',
      blogs: 3
    });
  });
});


describe('countAuthorsLikes', () => {
  test('given a list with one blog, returns the amount of blogs from each author', () => {
    const result = listHelper.countAuthorsLikes(listWithOneBlog);
    expect(result).toEqual({
      'thykka': 3
    });
  });

  test('given a list of blogs, returns the amount of blogs from each author', () => {
    const result = listHelper.countAuthorsLikes(listWithManyBlogs);
    expect(result).toEqual({
      'Edsger W. Dijkstra': 17,
      'Michael Chan': 7,
      'Robert C. Martin': 12,
      'thykka': 3,
    });
  });
});


describe('mostLikes', () => {
  test('given a list of blogs, returns the author with most blogs', () => {
    const result = listHelper.mostLikes(listWithManyBlogs);
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 17
    });
  });
});
