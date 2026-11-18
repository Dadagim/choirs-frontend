export default function Map({place}) {
  // Replace this URL with the 'src' link from your Google Maps embed code
    const encodedLocation = encodeURIComponent(place);
    const mapSrc = `https://www.google.com/maps?q=${encodedLocation}&output=embed`;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow rounded-lg mt-6">
      <h2 className="text-2xl font-bold mb-4">Event Location 🗺️</h2>
      
      {/* Responsive container for the iframe */}
      <div className="w-full h-96 overflow-hidden rounded-lg border">
        <iframe
          src={mapSrc}
          width="100%"
          height="100%"
          style={{ border: 0 }}
          allowFullScreen=""
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Event Venue Map"
        ></iframe>

      </div>
    </div>
  );
}

