import React, { useState } from 'react';
import { Tabs } from 'react-daisyui'; // Importing Tabs component
import { HideMessagePage } from './HideMessagePage';

const TAB_CONTENTS = [
  {
    id: 0,
    title: 'Hide Message',
    component: <HideMessagePage />,
  },
  {
    id: 1,
    title: 'Extract Message',
    component: <div>Content for Extract Message</div>,
  },
];

export const Home: React.FC = () => {
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
      <div className="max-w-md w-full">
        <Tabs variant="boxed" size="md">
          {onRenderTab()}
        </Tabs>
        <div className="p-4">{TAB_CONTENTS[activeTab].component}</div>
      </div>
    </div>
  );
};
