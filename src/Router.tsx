import React, { useState, useEffect } from 'react';
import App from './App';
import BlueprintsApp from './BlueprintsApp';
import StoryPage from './pages/StoryPage';

type Route = 'design-system' | 'blueprints' | 'story';

const Router: React.FC = () => {
  const [currentRoute, setCurrentRoute] = useState<Route>('design-system');
  const [storyId, setStoryId] = useState<string | null>(null);

  const parseRouteFromLocation = (): { route: Route; storyId: string | null } => {
    const { hash, pathname } = window.location;
    const cleanHash = hash.startsWith('#') ? hash.slice(1) : hash;

    // Support hash-based story route: #story/123
    if (cleanHash.startsWith('story/')) {
      const id = cleanHash.split('/')[1] || null;
      return { route: 'story', storyId: id };
    }

    // Support path-based story route: /story/123
    if (pathname.startsWith('/story/')) {
      const parts = pathname.split('/');
      const id = parts[2] || null;
      return { route: 'story', storyId: id };
    }

    // Existing routes for blueprints
    if (
      cleanHash === 'blueprints' ||
      cleanHash.startsWith('companies') ||
      cleanHash.startsWith('/companies') ||
      cleanHash.startsWith('lab') ||
      cleanHash.startsWith('/lab')
    ) {
      return { route: 'blueprints', storyId: null };
    }

    return { route: 'design-system', storyId: null };
  };

  useEffect(() => {
    const { route, storyId } = parseRouteFromLocation();
    setCurrentRoute(route);
    setStoryId(storyId);
  }, []);

  useEffect(() => {
    const syncFromLocation = () => {
      const { route, storyId } = parseRouteFromLocation();
      setCurrentRoute(route);
      setStoryId(storyId);
    };

    window.addEventListener('hashchange', syncFromLocation);
    window.addEventListener('popstate', syncFromLocation);
    return () => {
      window.removeEventListener('hashchange', syncFromLocation);
      window.removeEventListener('popstate', syncFromLocation);
    };
  }, []);

  const navigateToBlueprints = () => {
    window.location.hash = '#blueprints';
    setCurrentRoute('blueprints');
  };

  const navigateToDesignSystem = () => {
    window.location.hash = '#overview';
    setCurrentRoute('design-system');
  };

  // Pass navigation functions to the apps
  if (currentRoute === 'blueprints') {
    return <BlueprintsApp onBackToDesignSystem={navigateToDesignSystem} />;
  }

  if (currentRoute === 'story') {
    return <StoryPage id={storyId ?? undefined} />;
  }

  return <App onNavigateToBlueprints={navigateToBlueprints} />;
};

export default Router;
