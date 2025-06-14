import React from 'react';
import { Spin, Alert, Pagination } from 'antd';
import SearchBar from '../SearchBar/SearchBar';
import MovieList from '../MovieList/MovieList';

const SearchTab = ({
  movies,
  loading,
  error,
  currentPage,
  totalResults,
  query,
  genres,
  ratedMap,
  onSearchChange,
  onRate,
  onPageChange,
}) => {
  return (
    <>
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <SearchBar onSearchChange={onSearchChange} defaultValue={query} />
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
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
          <MovieList
            movies={movies}
            onRate={onRate}
            isRatedTab={false}
            ratedMap={ratedMap}
            genres={genres}
          />
        </div>
      )}

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
        <Pagination
          current={currentPage}
          pageSize={20}
          total={totalResults}
          onChange={onPageChange}
          showSizeChanger={false}
        />
      </div>
    </>
  );
};

export default SearchTab;
