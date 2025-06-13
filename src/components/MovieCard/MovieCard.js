// src/components/MovieCard/MovieCard.js
import React from 'react';
import { Card, Tag, Rate } from 'antd';
import { format } from 'date-fns';

class MovieCard extends React.Component {

  getColor(rating) {
  if (rating === null || rating === undefined) return "#ccc"; 
  if (rating <= 3) return "#E90000";
  if (rating <= 5) return "#E97E00";
  if (rating <= 7) return "#E9D100";
  return "#66E900";
}



  spliceText(text, maxLength) {
    if (!text) return '';
    if (text.length <= maxLength) {
      return text;
    }

    const truncated = text.substr(0, maxLength);
    const lastSpaceIndex = truncated.lastIndexOf(' ');
    return truncated.substr(0, lastSpaceIndex) + '...';
  }

  render() {
    
    const { movie, onRate, isRatedTab, ratedMap, genres } = this.props;


    const ratingValue = isRatedTab ? movie.rating || 0 : (ratedMap && ratedMap[movie.id]) || 0;

   const movieGenres = movie.genres
  ? movie.genres
  : (genres && movie.genre_ids
      ? genres.filter((g) => movie.genre_ids.includes(g.id))
      : []
    );

    const currentRating = movie.rating || movie.vote_average; 



    return (
        
      <Card
        hoverable
        style={{
        //   width: '100%',
          position: 'relative',
          minHeight: '279px',
          display: 'flex',
          overflow: 'hidden'
        }}
        cover={
          movie.poster_path ? (
            <img
              style={{
                width: '181px',
                height: '281px'       
               }}   
              alt={movie.title}
              src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
            />
          ) : (
            <div style={{ height: '300px', background: '#eee' }} />
          )
        }
      >
        <div style={{
          position: 'absolute',
          top: 16,
          right: 16,
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: '#fff', 
          color: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          border: `3px solid ${this.getColor(currentRating)}`,
          boxSizing: 'border-box',
          boxShadow: '0 0 8px #eee'
        }}>
        {currentRating !== undefined ? currentRating.toFixed(1) : '-'}
        </div>


        <Card.Meta
          title={movie.title}
          description={
          <>  
          <p>{movie.release_date ? format(new Date(movie.release_date), 'MMMM d, yyyy') : 'Unknown'}</p>
          <p>{this.spliceText(movie.overview, 100)}</p>
          <p>
            {movieGenres.map((g) => (
            <Tag key={g.id}>{g.name}</Tag>
          ))}
          </p>

          </>
  }
/>

        <Rate
            allowHalf
            count={10}
            value={ratingValue}
            onChange={(value) => onRate(movie.id, value)}
        />

      </Card>
    );
  }
}

export default MovieCard;
