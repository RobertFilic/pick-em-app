'use client';

import React, { useState, useEffect } from 'react';
import { X, Settings, Shield, BarChart3, Target, User, Lock } from 'lucide-react';
import { consentManager, type ConsentSettings } from '@/lib/consent';

export default function ConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [customSettings, setCustomSettings] = useState<Partial<ConsentSettings>>({
    analytics_storage: 'granted', // Default for your business model
    ad_storage: 'denied',
    functionality_storage: 'denied',
    personalization_storage: 'denied',
  });

  useEffect(() => {
    // Check if user has already made a consent choice
    if (!consentManager.hasStoredConsent()) {
      setShowBanner(true);
    } else {
      // Load and apply stored consent
      const stored = consentManager.loadStoredConsent();
      if (stored) {
        consentManager.updateConsent(stored);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    consentManager.acceptAll();
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    consentManager.rejectAll();
    setShowBanner(false);
  };

  const handleEssentialOnly = () => {
    consentManager.essentialOnly();
    setShowBanner(false);
  };

  const handleCustomSave = () => {
    consentManager.updateConsent(customSettings);
    setShowBanner(false);
    setShowDetails(false);
  };

  const updateCustomSetting = (key: keyof ConsentSettings, value: 'granted' | 'denied') => {
    setCustomSettings(prev => ({ ...prev, [key]: value }));
  };

  if (!showBanner) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100]" />
      
      {/* Banner */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t-2 border-blue-600 shadow-2xl z-[101]">
        <div className="max-w-7xl mx-auto p-6">
          {!showDetails ? (
            // Simple Banner
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-lg">We Value Your Privacy</h3>
                </div>
                <p className="text-gray-600 dark:text-gray-400 text-sm lg:text-base">
                  We use cookies to improve your experience and analyze how you use PlayPredix. 
                  Your sports predictions are more fun when we can personalize your experience!
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3 lg:flex-nowrap">
                <button
                  onClick={() => setShowDetails(true)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Customize
                </button>
                
                <button
                  onClick={handleEssentialOnly}
                  className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Essential Only
                </button>
                
                <button
                  onClick={handleAcceptAll}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Accept All
                </button>
              </div>
            </div>
          ) : (
            // Detailed Settings
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold">Privacy Preferences</h3>
                <button
                  onClick={() => setShowDetails(false)}
                  className="p-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Essential Cookies */}
                <div className="flex items-start gap-4 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <Lock className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold text-green-900 dark:text-green-100">Essential Cookies</h4>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-800 text-green-800 dark:text-green-200 text-xs rounded-full font-medium">
                        Always Active
                      </span>
                    </div>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Required for basic website functionality, security, and your account access.
                    </p>
                  </div>
                </div>

                {/* Analytics */}
                <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <BarChart3 className="w-6 h-6 text-blue-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Analytics Cookies</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customSettings.analytics_storage === 'granted'}
                          onChange={(e) => updateCustomSetting('analytics_storage', e.target.checked ? 'granted' : 'denied')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Help us understand how you use PlayPredix to improve your prediction experience. 
                      <span className="font-medium text-blue-600"> Recommended for sports fans!</span>
                    </p>
                  </div>
                </div>

                {/* Personalization */}
                <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <User className="w-6 h-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Personalization</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customSettings.personalization_storage === 'granted'}
                          onChange={(e) => updateCustomSetting('personalization_storage', e.target.checked ? 'granted' : 'denied')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-purple-300 dark:peer-focus:ring-purple-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-purple-600"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Remember your preferences and provide customized content based on your sports interests.
                    </p>
                  </div>
                </div>

                {/* Advertising */}
                <div className="flex items-start gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                  <Target className="w-6 h-6 text-orange-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold">Advertising</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={customSettings.ad_storage === 'granted'}
                          onChange={(e) => updateCustomSetting('ad_storage', e.target.checked ? 'granted' : 'denied')}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 dark:peer-focus:ring-orange-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-600"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Show you relevant sports-related ads and measure their effectiveness.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleRejectAll}
                  className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg transition-colors"
                >
                  Reject All
                </button>
                
                <div className="flex-1" />
                
                <button
                  onClick={handleCustomSave}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  Save Preferences
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}