// src/components/MovieList/MovieList.js
import React from 'react';
import { Row, Col } from 'antd';
import MovieCard from '../MovieCard/MovieCard';

const MovieList = ({ movies, onRate, isRatedTab, ratedMap, genres }) => {
    
    return (
    <Row gutter={[32, 32]}>
      {movies.map((movie) => (
        <Col key={movie.id} span={12}>
          <MovieCard
          key={movie.id}
          movie={movie}
          onRate={onRate}
          isRatedTab={isRatedTab}
          ratedMap={ratedMap}
          genres={genres}
          />
        </Col>
      ))}
    </Row>
  );
};

export default MovieList;
