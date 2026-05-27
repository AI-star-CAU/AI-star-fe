import React from 'react';
import { Link } from 'react-router-dom';
import { PATHS } from '../app/router/routes';
import { LLM_OPTIONS } from '../features/chat/constants/llm';
import { LANGUAGE_OPTIONS, THEME_OPTIONS } from '../features/settings/constants';
import SettingsSelect from '../features/settings/components/SettingsSelect';
import { useSettings } from '../features/settings/hooks/useSettings';
import type { LlmModel } from '../features/chat/types';

interface SettingsRowProps {
  title: string;
  description: string;
  control: React.ReactNode;
}

const SettingsRow: React.FC<SettingsRowProps> = ({ title, description, control }) => (
  <div
    style={{
      display: 'grid',
      gridTemplateColumns: '1fr auto',
      alignItems: 'center',
      gap: 24,
      padding: '16px 0',
      borderBottom: '1px dotted var(--rule-thin)',
    }}
  >
    <div>
      <b
        style={{
          fontFamily: 'var(--body)',
          fontWeight: 600,
          fontSize: 17,
          display: 'block',
          color: 'var(--ink)',
        }}
      >
        {title}
      </b>
      <span
        style={{
          fontFamily: 'var(--body)',
          color: 'var(--ink-3)',
          fontSize: 13,
        }}
      >
        {description}
      </span>
    </div>
    <div>{control}</div>
  </div>
);

interface SettingsSectionProps {
  title: string;
  children: React.ReactNode;
  isFirst?: boolean;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({ title, children, isFirst }) => (
  <div
    style={{
      borderTop: isFirst ? 'none' : '3px double var(--rule)',
      paddingTop: isFirst ? 0 : 14,
      marginTop: isFirst ? 0 : 24,
    }}
  >
    <h3
      style={{
        fontFamily: 'var(--type)',
        fontSize: 11,
        letterSpacing: '0.3em',
        textTransform: 'uppercase',
        color: 'var(--red-deep)',
        margin: '0 0 14px',
      }}
    >
      ― {title} ―
    </h3>
    {children}
  </div>
);

const SettingsPage: React.FC = () => {
  const { settings, updateSettings } = useSettings();

  const handleReset = () => {
    updateSettings({
      defaultLlmModel: LLM_OPTIONS[0].model,
      themeMode: 'system',
      language: 'ko',
    });
  };

  return (
    <div className="min-h-screen">
      <header
        className="h-14 flex items-center justify-between px-5 sticky top-0 z-40"
        style={{
          background: 'var(--paper-card)',
          borderBottom: '1px solid var(--rule)',
        }}
      >
        <Link
          to={PATHS.CHAT}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            color: 'var(--ink-2)',
            fontFamily: 'var(--type)',
            fontSize: 11,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
          }}
        >
          ◂ 대화로 돌아가기
        </Link>

        <Link to={PATHS.CHAT} className="nm-mini-mast hover:opacity-80 transition">
          AIT
        </Link>

        <button
          type="button"
          onClick={handleReset}
          className="nm-btn nm-btn-ghost"
          style={{ height: 30, padding: '0 12px', fontSize: 11 }}
        >
          초기화
        </button>
      </header>

      <header className="nm-masthead">
        <div className="nm-mast-top">
          <span>SETTINGS</span>
          <span>환경 설정</span>
          <span className="nm-mast-badge">Preferences</span>
        </div>
        <h1 className="nm-mast-name">
          설정
        </h1>
        <div className="nm-mast-tagline">기본 모델과 화면 환경을 조정합니다</div>
      </header>

      <main
        className="max-w-3xl mx-auto"
        style={{ padding: '30px 32px 48px' }}
      >
        <SettingsSection title="AI 모델" isFirst>
          <SettingsRow
            title="기본 모델"
            description="새 대화를 시작할 때 사용할 모델"
            control={
              <SettingsSelect
                id="default-llm-model"
                value={settings.defaultLlmModel}
                options={LLM_OPTIONS.map(option => ({
                  value: option.model,
                  label: option.label,
                }))}
                onChange={value => updateSettings({ defaultLlmModel: value as LlmModel })}
              />
            }
          />
        </SettingsSection>

        <SettingsSection title="일반">
          <SettingsRow
            title="화면 테마"
            description="인터페이스 표시 방식을 결정합니다"
            control={
              <SettingsSelect
                id="theme-mode"
                value={settings.themeMode}
                options={THEME_OPTIONS}
                onChange={themeMode => updateSettings({ themeMode })}
              />
            }
          />
          <SettingsRow
            title="언어"
            description="인터페이스 언어"
            control={
              <SettingsSelect
                id="language"
                value={settings.language}
                options={LANGUAGE_OPTIONS}
                onChange={language => updateSettings({ language })}
              />
            }
          />
        </SettingsSection>

        <p
          style={{
            textAlign: 'center',
            marginTop: 30,
            fontFamily: 'var(--body)',
            color: 'var(--ink-faint)',
            fontSize: 12,
          }}
        >
          AIT settings
        </p>
      </main>
    </div>
  );
};

export default SettingsPage;
