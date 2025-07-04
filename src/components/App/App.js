import React, { Component } from 'react';
import { Offline, Online } from 'react-detect-offline';
import { Tabs } from 'antd';
import debounce from 'lodash/debounce';
import ServiceContext from '../ServiceContext/ServiceContext'; 
import SearchTab from '../SearchTab/SearchTab';
import RatedTab from '../RatedTab/RatedTab';

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
    this.setState({ query: value, currentPage: 1 }, this.fetchMovies);
  }, 500);

  handlePageChange = (page) => {
    this.setState({ currentPage: page }, this.fetchMovies);
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
    if (value < 0.5 || value > 10) return;

    try {
      await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/rating?api_key=${API_KEY}&guest_session_id=${guestSessionId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json;charset=utf-8' },
          body: JSON.stringify({ value }),
        }
      );

      this.setState((prevState) => ({
        ratedMap: { ...prevState.ratedMap, [movieId]: value },
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
        `https://api.themoviedb.org/3/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${currentPage}`
      );

      if (!response.ok) throw new Error(`Ашыбка сервера: ${response.status}`);

      const data = await response.json();
      this.setState({
        movies: data.results,
        totalResults: data.total_results,
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

  fetchRatedMovies = async () => {
    const { guestSessionId } = this.state;
    this.setState({ loading: true, error: null });

    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/guest_session/${guestSessionId}/rated/movies?api_key=${API_KEY}&language=en-US&sort_by=created_at.asc`
      );
      const data = await response.json();
      this.setState({ ratedMovies: data.results || [], loading: false, error: null });
    } catch (error) {
      this.setState({ loading: false, error: error.message || 'Ошибка сети' });
    }
  };

  handleTabChange = (key) => {
    this.setState({ currentTab: key }, () => {
      if (key === '2') this.fetchRatedMovies();
    });
  };

  render() {
    const {
      movies, ratedMovies, loading, error, currentPage,
      totalResults, genres, query, ratedMap, currentTab
    } = this.state;

    const tabsItems = [
      {
        label: 'Search',
        key: '1',
        children: (
          <SearchTab
            movies={movies}
            loading={loading}
            error={error}
            currentPage={currentPage}
            totalResults={totalResults}
            query={query}
            genres={genres}
            ratedMap={ratedMap}
            onSearchChange={this.handleSearchInputChange}
            onRate={this.handleRate}
            onPageChange={this.handlePageChange}
          />
        )
      },
      {
        label: 'Rated',
        key: '2',
        children: (
          <RatedTab
            ratedMovies={ratedMovies}
            loading={loading}
            error={error}
            genres={genres}
            ratedMap={ratedMap}
            onRate={this.handleRate}
          />
        )
      }
    ];

    return (
      <ServiceContext.Provider value={genres}>
        <div style={{ padding: '20px' }}>
          <h1>Movie App</h1>

          <Offline>
            <div style={{ maxWidth: '600px', margin: '20px auto' }}>
              <p style={{ color: 'red' }}>Проблемы с интернетом</p>
            </div>
          </Offline>

          <Online>
            <Tabs
              activeKey={currentTab}
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
