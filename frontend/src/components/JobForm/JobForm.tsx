import { Loader2, Send } from 'lucide-react';
import { useState } from 'react';
import { useJobsStore } from '../../store/jobsStore';

const URL_REGEX = /^https?:\/\/.+/;

export function JobForm() {
  const [urlsText, setUrlsText] = useState('');
  const createJob = useJobsStore((state) => state.createJob);
  const creating = useJobsStore((state) => state.creating);
  const clearError = useJobsStore((state) => state.clearError);
  const setError = useJobsStore((state) => state.setError);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const urls = urlsText
      .split('\n')
      .map((url) => url.trim())
      .filter((url) => url.length > 0);

    if (urls.length === 0) {
      setError('Введите хотя бы один URL');
      return;
    }

    const invalidUrls = urls.filter((url) => !URL_REGEX.test(url));
    if (invalidUrls.length > 0) {
      setError(`Невалидный URL: ${invalidUrls[0]}. URL должен начинаться с http:// или https://`);
      return;
    }

    clearError();
    void createJob({ urls });
    setUrlsText('');
  };

  return (
    <form className="flex flex-col gap-3 mb-8" onSubmit={handleSubmit}>
      <textarea
        className="w-full min-h-[100px] p-3 border border-gray-300 rounded-lg font-inherit text-sm resize-y transition-colors focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
        value={urlsText}
        onChange={(e) => setUrlsText(e.target.value)}
        placeholder={'Введите URL, по одному на строку\nhttps://example.com\nhttps://google.com'}
        disabled={creating}
      />
      <button
        type="submit"
        className="inline-flex items-center gap-2 self-start px-6 py-2.5 bg-blue-500 text-white border-none rounded-lg text-sm font-medium cursor-pointer transition-colors hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed"
        disabled={creating || !urlsText.trim()}
      >
        {creating ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            Создание...
          </>
        ) : (
          <>
            <Send className="w-4 h-4" />
            Запустить проверку
          </>
        )}
      </button>
    </form>
  );
}
