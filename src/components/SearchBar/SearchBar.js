import React from 'react';
import { Input } from 'antd';

class SearchBar extends React.Component {
  render() {
    return (
      <Input 
        type="text"
        placeholder="Не трать время..."
        onChange={(e) => this.props.onSearchChange(e.target.value)}
        style={{ width: '100%', marginBottom: '20px', padding: '8px' }}
      />
    );
  }
}

export default SearchBar;
