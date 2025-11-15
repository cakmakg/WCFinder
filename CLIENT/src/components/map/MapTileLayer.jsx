// components/map/MapTileLayer.jsx
import React, { useState } from 'react';
import { TileLayer } from 'react-leaflet';

/**
 * Modern harita tile layer component
 * CartoDB Positron - Modern, temiz ve ücretsiz harita servisi
 * Alternatif olarak CartoDB Voyager veya Stamen Terrain kullanılabilir
 */
export const MapTileLayer = ({ mapStyle = 'voyager' }) => {
  const [tileError, setTileError] = useState(false);

  // Harita stilleri
  const mapStyles = {
    // CartoDB Voyager - Daha renkli ve detaylı (ÖNERİLEN - daha anlaşılır)
    voyager: {
      url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    },
    // CartoDB Positron - Modern, temiz, minimal (çok beyaz)
    positron: {
      url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    },
    // CartoDB Dark Matter - Koyu tema
    dark: {
      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 19
    },
    // Stamen Terrain - Doğal görünüm, topografik
    terrain: {
      url: 'https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png',
      attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abcd',
      maxZoom: 18
    },
    // OpenStreetMap - Standart, klasik görünüm
    osm: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      subdomains: 'abc',
      maxZoom: 19
    }
  };

  const selectedStyle = mapStyles[mapStyle] || mapStyles.voyager;

  // Hata durumunda fallback
  if (tileError && mapStyle !== 'osm') {
    return (
      <TileLayer
        url={mapStyles.osm.url}
        attribution={mapStyles.osm.attribution}
        subdomains={mapStyles.osm.subdomains}
        maxZoom={mapStyles.osm.maxZoom}
      />
    );
  }

  return (
    <TileLayer
      url={selectedStyle.url}
      attribution={selectedStyle.attribution}
      subdomains={selectedStyle.subdomains}
      maxZoom={selectedStyle.maxZoom}
      onError={() => {
        if (!tileError) {
          setTileError(true);
        }
      }}
    />
  );
};

export default MapTileLayer;

