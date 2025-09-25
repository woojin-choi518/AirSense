'use client';

interface TextContentProps {
  title: string;
  subTitle: string;
  description: string;
  isDark: boolean;
  isMobile?: boolean;
}

export default function TextContent({ title, subTitle, description, isDark, isMobile = false }: TextContentProps) {
  const titleClass = isDark ? 'text-[#F5E6C8]' : 'text-green-600';
  const subTitleClass = isDark ? 'text-white' : 'text-black';

  if (isMobile) {
    return (
      <div className="text-center mb-6">
        <h2 className={`text-2xl font-extrabold mb-2 ${titleClass}`}>
          {title}
        </h2>
        <p className={`whitespace-pre-line text-xl font-extrabold ${subTitleClass}`}>
          {subTitle}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="self-start text-left">
        <h2 className={`text-2xl md:text-2xl font-extrabold mb-2 ${isDark ? 'text-[#FFF6D1]' : 'text-green-600'}`}>
          {title}
        </h2>
        <p className={`whitespace-pre-line text-xl md:text-4xl font-extrabold ${subTitleClass}`}>
          {subTitle}
        </p>
      </div>
      <div className="self-start text-left">
        <p className={`text-base md:text-2xl ${isDark ? 'text-[#FFF6D1]' : 'text-gray-900'}`}>
          {description}
        </p>
      </div>
    </>
  );
}
