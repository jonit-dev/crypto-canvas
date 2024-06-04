import { observer } from 'mobx-react-lite';
import React, { useState } from 'react';
import { Tabs } from 'react-daisyui'; // Importing Tabs component
import { ExtractMessageTab } from './ExtractMessageTab';
import { GenerateBIP39SeedPhraseCoordinates } from './GenerateBIP39SeedPhraseCoordinates';
import { GenerateEncryptionKeyTab } from './GenerateEncryptionKeyTab';
import { GenerateSeedPhraseTab } from './GenerateSeedPhraseTab';
import { HideMessageTab } from './HideMessageTab';

const TAB_CONTENTS = [
  {
    id: 0,
    title: 'Hide Message',
    component: <HideMessageTab />,
  },
  {
    id: 1,
    title: 'Extract Message',
    component: <ExtractMessageTab />,
  },
  {
    id: 2,
    title: 'Generate Encryption Key',
    component: <GenerateEncryptionKeyTab />,
  },

  {
    id: 3,
    title: 'Generate Seed Phrase',
    component: <GenerateSeedPhraseTab />,
  },
  {
    id: 4,
    title: 'BIP39 Coordinates Seed Phrase',
    component: <GenerateBIP39SeedPhraseCoordinates />,
  },
];

export const HomePage: React.FC = observer(() => {
  const [activeTab, setActiveTab] = useState(0);

  const onTabClick = (index: number) => {
    setActiveTab(index);
  };

  const onRenderTab = () =>
    TAB_CONTENTS.map((tab, index) => {
      return (
        <Tabs.Tab
          key={tab.id}
          tabIndex={index}
          active={activeTab === index}
          onClick={() => onTabClick(index)}
        >
          {tab.title}
        </Tabs.Tab>
      );
    });
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-100 dark:bg-dark-bg">
      <div className="max-w-4xl w-full">
        <Tabs variant="boxed" size="md">
          {onRenderTab()}
        </Tabs>

        <div className="p-4" style={{ minHeight: '450px', height: '100%' }}>
          {TAB_CONTENTS[activeTab].component}
        </div>
      </div>
    </div>
  );
});
