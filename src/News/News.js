import axios from 'axios';
async function  getNews(req, res) {
  const response = await axios.get('https://newsapi.org/v2/everything?q=bitcoin&apiKey=aea99efdde62429e8aa88c5a41cd354a')
  res.status(200).json({
    message: 'News fetched successfully',
    news: response.data
  });
}
export default getNews;
