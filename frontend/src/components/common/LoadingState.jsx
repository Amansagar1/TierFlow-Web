import React from 'react';
import { Loader2, Inbox, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const LoadingState = ({ message = 'Loading data...', minHeight = 'min-h-[250px]' }) => {
  return (
    <div className={`w-full flex flex-col items-center justify-center p-8 ${minHeight}`}>
      <Loader2 className="w-8 h-8 text-[#D97706] animate-spin mb-3" />
      <p className="text-sm font-medium text-slate-500">{message}</p>
    </div>
  );
};

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There is no data to display for your selection.',
  actionLabel,
  onAction,
}) => {
  return (
    <div className="w-full flex flex-col items-center justify-center p-10 text-center">
      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h4 className="text-sm font-bold text-slate-700 mb-1">{title}</h4>
      <p className="text-xs text-slate-500 max-w-sm mb-4">{description}</p>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
};

export const ErrorState = ({
  title = 'Unable to load data',
  message = 'An unexpected error occurred while communicating with the server.',
  onRetry,
}) => {
  return (
    <div className="w-full p-6 rounded-2xl bg-rose-50/70 border border-rose-200 text-center my-4">
      <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-2">
        <AlertCircle className="w-5 h-5" />
      </div>
      <h4 className="text-sm font-bold text-rose-800">{title}</h4>
      <p className="text-xs text-rose-600 mt-1 mb-3 max-w-md mx-auto">{message}</p>
      {onRetry && (
        <Button
          size="sm"
          variant="outline"
          onClick={onRetry}
          leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          className="border-rose-300 text-rose-700 hover:bg-rose-100/60"
        >
          Try Again
        </Button>
      )}
    </div>
  );
};
