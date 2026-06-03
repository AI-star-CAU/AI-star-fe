import React from 'react';

interface State {
  error: Error | null;
}

/**
 * 컴포넌트 트리 어딘가에서 발생한 렌더 오류로 화이트 스크린이 되는 걸 막는다.
 * 비동기 에러(fetch, Promise)는 잡지 못하므로 그쪽은 ApiError + Toast 가 담당.
 */
class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    console.error('[AppErrorBoundary]', error, info);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="min-h-screen flex items-center justify-center bg-ui-surface text-ui-text px-6">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold">화면을 그리는 중 문제가 발생했어요</h1>
          <p className="text-sm text-ui-text-subtle">
            새로고침하면 보통 해결돼요. 같은 문제가 반복되면 알려주세요.
          </p>
          <pre className="text-xs text-ui-text-faint bg-ui-surface-muted/60 rounded p-3 overflow-auto text-left">
            {this.state.error.message}
          </pre>
          <button
            type="button"
            onClick={this.handleReload}
            className="rounded-xl bg-ui-accent-soft px-5 py-2 text-sm font-semibold text-ui-text-inverse hover:bg-ui-surface-raised"
          >
            새로고침
          </button>
        </div>
      </div>
    );
  }
}

export default AppErrorBoundary;
