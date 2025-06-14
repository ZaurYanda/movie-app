import React from 'react';
import { Spin, Alert } from 'antd';
import MovieList from '../MovieList/MovieList';

const RatedTab = ({
  ratedMovies,
  loading,
  error,
  genres,
  ratedMap,
  onRate,
}) => {
  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
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
          onRate={onRate}
          isRatedTab={true}
          genres={genres}
          ratedMap={ratedMap}
        />
      )}
    </div>
  );
};

export default RatedTab;
