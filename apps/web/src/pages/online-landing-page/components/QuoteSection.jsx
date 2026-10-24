import React from 'react';

const QuoteSection = ({ quote, quoteAuthor, loading }) => {
  if (loading) {
    return (
      <div className="space-y-2">
        <div className="h-8 bg-white/20 rounded animate-pulse w-8" />
        <div className="h-5 bg-white/20 rounded animate-pulse w-full" />
        <div className="h-5 bg-white/20 rounded animate-pulse w-5/6" />
        <div className="h-4 bg-white/20 rounded animate-pulse w-28" />
      </div>
    );
  }

  return (
    <div>
      <span
        className="block text-5xl leading-none text-white/30 font-serif mb-1"
        aria-hidden="true"
      >
        &ldquo;
      </span>
      <p className="text-white text-base font-medium leading-relaxed -mt-3">
        {quote}
      </p>
      <p className="text-white/60 text-sm mt-2">&mdash; {quoteAuthor}</p>
    </div>
  );
};

export default QuoteSection;
