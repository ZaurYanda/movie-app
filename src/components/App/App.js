import React, { Component } from 'react';
import { Offline, Online } from 'react-detect-offline';
import { Spin, Alert, Pagination, Tabs } from 'antd';
import MovieList from '../MovieList/MovieList';
import SearchBar from '../SearchBar/SearchBar';
import debounce from 'lodash/debounce';
import ServiceContext from '../ServiceContext/ServiceContext'; 

const API_KEY = 'b13f24cba5750ce383f8785b115df8c9';

class App extends Component {
  state = {
    movies: [],
    ratedMovies: [],
    ratedMap: {},
    loading: true,
    error: null,
    query: 'return',
    currentPage: 1,
    totalResults: 0,
    genres: [],
    guestSessionId: null,
    currentTab: '1',
  };

  componentDidMount() {
    this.createGuestSession();
    this.fetchGenres();
    this.fetchMovies();
  }


  componentDidUpdate(prevProps, prevState) {
  
  if (
    this.state.currentTab === '2' &&
    this.state.guestSessionId &&
    prevState.guestSessionId !== this.state.guestSessionId
  ) {
    this.fetchRatedMovies();
  }
}

  handleSearchInputChange = debounce((value) => {
    this.setState(
      {
        query: value,
        currentPage: 1,
      },
      () => {
        this.fetchMovies();
      }
    );
  }, 500);

  handlePageChange = (page) => {
    this.setState(
      {
        currentPage: page,
      },
      () => {
        this.fetchMovies();
      }
    );
  };

  createGuestSession = async () => {
  const savedSessionId = localStorage.getItem('guestSessionId');
  if (savedSessionId) {
    this.setState({ guestSessionId: savedSessionId });
    return;
  }

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/authentication/guest_session/new?api_key=${API_KEY}`
    );
    const data = await response.json();
    this.setState({ guestSessionId: data.guest_session_id });
    localStorage.setItem('guestSessionId', data.guest_session_id); 
  } catch (error) {
    console.error('Ошибка гостевой сессии:', error);
  }
};


  fetchGenres = async () => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/genre/movie/list?api_key=${API_KEY}&language=en-US`
      );
      const data = await response.json();
      this.setState({ genres: data.genres });
    } catch (error) {
      console.error('Ошибка получения жанров:', error);
    }
  };

handleRate = async (movieId, value) => {
  const { guestSessionId } = this.state;
  const rating = value;

  if (rating < 0.5 || rating > 10) {
    console.error('Некорректное значение рейтинга для TMDB:', rating);
    return;
  }

  console.log('Отправляемый рейтинг:', rating);

  try {
    const response = await fetch(
      `https://api.themoviedb.org/3/movie/${movieId}/rating?api_key=${API_KEY}&guest_session_id=${guestSessionId}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json;charset=utf-8',
        },
        body: JSON.stringify({ value: rating }),
      }
    );

    const data = await response.json();
    console.log('Ответ TMDB:', response, data);

    this.setState((prevState) => ({
      ratedMap: {
        ...prevState.ratedMap,
        [movieId]: rating,
      },
    }));

    
    if (this.state.currentTab === '2') {
      this.fetchRatedMovies();
    }
  } catch (error) {
    console.error('Ошибка голосования:', error);
  }
};





  fetchMovies = async () => {
    const { query, currentPage } = this.state;

    this.setState({ loading: true, error: null });

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(
          query
        )}&page=${currentPage}`
      );

      if (!response.ok) {
        throw new Error(`Ашыбка сервера жи ес: ${response.status}`);
      }

      const data = await response.json();

      this.setState({
        movies: data.results,
        totalResults: data.total_results,
        loading: false,
        error: null,
      });

      console.log(data);
    } catch (error) {
      console.error('Ашыбка при получениииеее мувис:', error);

      this.setState({
        loading: false,
        error:
          error.message ||
          'С инетом траблы у тибя братишка, проверь инет жи ес',
      });
    }
  };

  handleTabChange = (key) => {
    this.setState({ currentTab: key }, () => {
      if (key === '2') {
        this.fetchRatedMovies();
      }
    });
  };

  fetchRatedMovies = async () => {
    const { guestSessionId } = this.state;
    this.setState({ loading: true, error: null });

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/guest_session/${guestSessionId}/rated/movies?api_key=${API_KEY}&language=en-US&sort_by=created_at.asc`
      );
      const data = await response.json();
      this.setState({
        ratedMovies: data.results || [],
        loading: false,
        error: null,
      });
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message || 'Ошибка сети',
      });
    }
  };

  render() {
    
    const {
      movies,
      ratedMovies,
      loading,
      error,
      currentPage,
      totalResults,
      genres,
    } = this.state;

    const tabsItems = [
      {
        label: 'Search',
        key: '1',
        children: (
          <>
            <div
              style={{
                maxWidth: '1200px',
                margin: '0 auto',
                padding: '20px',
              }}
            >
              <SearchBar onSearchChange={this.handleSearchInputChange} />
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Думаем жи есть">
                  <div style={{ height: '100px' }} />
                </Spin>
              </div>
            )}

            {error && (
              <Alert
                message="ashibka"
                description={error}
                type="error"
                showIcon
              />
            )}

            {!loading && !error && (
              <div
                style={{
                  maxWidth: '1200px',
                  margin: '0 auto',
                  padding: '20px',
                }}
              >
                <MovieList movies={movies}
                onRate={this.handleRate}
                isRatedTab={false}
                ratedMap={this.state.ratedMap} 
                genres={this.state.genres}
                />
              </div>
            )}

            <div
              style={{
                marginTop: '20px',
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              <Pagination
                current={currentPage}
                pageSize={20}
                total={totalResults}
                onChange={this.handlePageChange}
                showSizeChanger={false}
              />
            </div>
          </>
        ),
      },
      {
        label: 'Rated',
        key: '2',
        children: (
          <div
            style={{
              maxWidth: '1200px',
              margin: '0 auto',
              padding: '20px',
            }}
          >
            {loading && (
              <div style={{ textAlign: 'center', padding: '50px' }}>
                <Spin size="large" tip="Думаем жи есть">
                  <div style={{ height: '100px' }} />
                </Spin>
              </div>
            )}

            {error && (
              <Alert
                message="ashibka"
                description={error}
                type="error"
                showIcon
              />
            )}

            {!loading && !error && (
              <MovieList
              movies={ratedMovies}
              onRate={this.handleRate}
              isRatedTab={true} 
              genres={this.state.genres}
              />
            )}
          </div>
        ),
      },
    ];

    return (
      <ServiceContext.Provider value={genres}>
        <div style={{ padding: '20px' }}>
          <h1>Movie App</h1>

          <Offline>
            <div style={{ maxWidth: '600px', margin: '20px auto' }}>
              <Alert
                message="ashibka"
                description="чё с твоим инетом братишкааа??"
                type="error"
                showIcon
              />
            </div>
          </Offline>

          <Online>
            <Tabs
              defaultActiveKey="1"
              onChange={this.handleTabChange}
              items={tabsItems}
              centered
            />
          </Online>
        </div>
      </ServiceContext.Provider>
    );
  }
}

export default App;
