export const formatStartDate = (dateString: string | number | Date) => {
  const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric',
      timeZoneName: 'short',
  };
  
  const formattedDate = new Date(dateString).toLocaleDateString('en-US', options);
  return formattedDate;
};
