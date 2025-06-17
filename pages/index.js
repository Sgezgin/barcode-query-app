import { useState } from 'react';
import Head from 'next/head';
import LoginForm from '../components/LoginForm';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import QueryTab from '../components/QueryTab';
import UploadTab from '../components/UploadTab';
import ResultsTab from '../components/ResultsTab';

export default function Home() {
  // Authentication state
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({
    username: 'admin',
    password: 'admin'
  });

  // Application state
  const [activeTab, setActiveTab] = useState('query');
  const [queryResults, setQueryResults] = useState([]);

  // Handlers
  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setActiveTab('query');
    // Optionally clear results on logout
    // setQueryResults([]);
  };

  const handleUpdateCredentials = (newCredentials) => {
    setCredentials(newCredentials);
  };

  const handleQueryComplete = (results) => {
    // Add new results to existing results
    setQueryResults(prevResults => [...prevResults, ...results]);
    
    // Switch to results tab to show the new results
    setTimeout(() => {
      setActiveTab('results');
    }, 500);
  };

  const handleClearResults = () => {
    setQueryResults([]);
  };

  // If not logged in, show login form
  if (!isLoggedIn) {
    return (
      <>
        <Head>
          <title>Barcode Query System - Giriş</title>
          <meta name="description" content="Carrier Label sorgulama sistemi" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <LoginForm 
          onLogin={handleLogin} 
          credentials={credentials}
        />
      </>
    );
  }

  // Main application
  return (
    <>
      <Head>
        <title>Barcode Query System</title>
        <meta name="description" content="Carrier Label sorgulama ve yönetim sistemi" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen p-4">
        {/* Header */}
        <Header 
          onLogout={handleLogout}
          credentials={credentials}
          onUpdateCredentials={handleUpdateCredentials}
        />

        {/* Navigation */}
        <Navigation 
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          resultCount={queryResults.length}
        />

        {/* Tab Content */}
        <div className="animate-fade-in">
          {activeTab === 'query' && (
            <QueryTab onQueryComplete={handleQueryComplete} />
          )}
          
          {activeTab === 'upload' && (
            <UploadTab onQueryComplete={handleQueryComplete} />
          )}
          
          {activeTab === 'results' && (
            <ResultsTab queryResults={queryResults} />
          )}
        </div>

        {/* Quick Actions Floating Button */}
        {queryResults.length > 0 && activeTab !== 'results' && (
          <div className="fixed bottom-6 right-6 z-30">
            <button
              onClick={() => setActiveTab('results')}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 group"
              title="Sonuçları Görüntüle"
            >
              <div className="relative">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {queryResults.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                    {queryResults.length > 9 ? '9+' : queryResults.length}
                  </span>
                )}
              </div>
            </button>
          </div>
        )}

        {/* Clear Results Button (only visible in results tab) */}
        {activeTab === 'results' && queryResults.length > 0 && (
          <div className="fixed bottom-6 left-6 z-30">
            <button
              onClick={handleClearResults}
              className="bg-red-500/80 hover:bg-red-500 text-white p-3 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300"
              title="Tüm Sonuçları Temizle"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </>
  );
}