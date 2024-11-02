import { useState, useEffect } from 'react'
import Papa from 'papaparse'
import * as d3 from 'd3';
import cloud from 'd3-cloud';

function App() {
  const [profileData, setProfileData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleFileUpload = async (event) => {
    setIsLoading(true)
    const file = event.target.files[0]
    
    Papa.parse(file, {
      complete: (results) => {
        // Convert CSV data to our needed format
        const data = results.data[1] // Get first row of data
        const headers = results.data[0] // Get headers
        
        const processedData = {}
        headers.forEach((header, index) => {
          let value = data[index]
          // Split strings with semicolons into arrays
          if (value && value.includes('; ')) {
            processedData[header] = value.split('; ')
          } else {
            processedData[header] = value
          }
        })
        
        setProfileData(processedData)
        setIsLoading(false)
      },
      header: false
    })
  }

  const getWordFrequency = (items) => {
    const freqMap = {};
    items.forEach(item => {
      const words = item.toLowerCase().split(/[\s-]+/).filter(word => 
        word.length > 2 && 
        !['and', 'the', 'for', 'with', 'in', 'of', 'to'].includes(word)
      );
      
      words.forEach(word => {
        if (!freqMap[word]) freqMap[word] = 0;
        freqMap[word] += 1;
      });
    });

    return Object.keys(freqMap).map(word => ({
      text: word,
      value: freqMap[word]
    }));
  };

  useEffect(() => {
    if (!profileData) return;
    
    // Ensure DOM elements exist before rendering
    const skillsElement = document.getElementById('skills-cloud');
    const interestsElement = document.getElementById('interests-cloud');
    
    if (skillsElement && profileData['Member Skills']) {
      renderWordCloud('skills-cloud', profileData['Member Skills']);
    }
    
    if (interestsElement && profileData['Member Interests']) {
      renderWordCloud('interests-cloud', profileData['Member Interests'], '#22C55E');
    }
  }, [profileData]);

  const renderWordCloud = (elementId, data, color = '#4A90E2') => {
    if (!data) return;
    
    const element = document.getElementById(elementId);
    if (!element) return;
    
    const words = getWordFrequency(data);
    const width = element.clientWidth || 300; // Fallback width
    const height = element.clientHeight || 300; // Fallback height
    
    // Clear previous content
    d3.select(`#${elementId}`).selectAll('*').remove();
    
    const layout = cloud()
      .size([width, height])
      .words(words)
      .padding(5)
      .rotate(0)
      .fontSize(d => Math.sqrt(d.value) * 10)
      .on('end', draw);
    
    function draw(words) {
      d3.select(`#${elementId}`)
        .append('svg')
        .attr('width', width)
        .attr('height', height)
        .append('g')
        .attr('transform', `translate(${width/2},${height/2})`)
        .selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', d => `${d.size}px`)
        .style('fill', color)
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .text(d => d.text);
    }
    
    layout.start();
  };


  return (
    <div className="min-h-screen bg-gray-100">
      <div className="flex flex-col space-y-8 p-8">
        <h1 className="text-4xl font-bold text-center">LinkedIn Knows 👀👀</h1>
        
        {profileData && (
          <div className="text-center text-xl flex items-center justify-center gap-4">
            <a href="https://surferprotocol.org" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500 cursor-pointe">Built with 🏄</a>
            {'|'}
            <a onClick={() => setProfileData(null)} className="hover:underline text-blue-500 cursor-pointer">Back</a>
            {'|'}
            <a href="https://github.com/sahil-lalani/linkedin-knows" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-500 cursor-pointer">Code</a>
          </div>
        )}

        {!profileData ? (
          <div className="flex flex-col items-center justify-center space-y-8">
            <label 
              htmlFor="csvFile"
              className="bg-blue-500 text-white px-6 py-3 rounded-lg cursor-pointer hover:bg-blue-600 transition"
            >
              Upload Your Ad_Targeting.csv
            </label>
            <input 
              type="file" 
              id="csvFile" 
              accept=".csv" 
              onChange={handleFileUpload} 
              className="hidden"
            />
            <p className="text-sm text-gray-500">
              Get your Ad_Targeting.csv by following the instructions <a className='underline text-blue-500'  href="https://surferprotocol.org/platforms/social-media/linkedin/linkedin-default" target="_blank" rel="noopener noreferrer">here</a>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
              {/* Basic Information */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-2xl font-semibold mb-4">Basic Information</h2>
                <div className="space-y-2">
                  <p><span className="font-semibold">Age Group:</span> {profileData['Member Age']}</p>
                  <p><span className="font-semibold">Gender:</span> {profileData['Member Gender']}</p>
                  <p><span className="font-semibold">Experience:</span> {profileData['Years of Experience']}</p>
                  <p><span className="font-semibold">Education:</span> {profileData['Degrees']}</p>
                  <p><span className="font-semibold">Graduation Year:</span> {profileData['Graduation Year']}</p>
                  <p><span className="font-semibold">Field:</span> {profileData['Fields of Study']}</p>
                </div>
              </div>
            {/* Skills Word Cloud */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Skills</h2>
              <div id="skills-cloud"></div>
            </div>

            {/* Job Titles */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Job Titles</h2>
              <div className="flex flex-wrap gap-2">
                  {profileData['Job Titles'] && profileData['Job Titles'].map((title) => (
                    <div key={title} className="bg-blue-500 text-white rounded-md p-2">
                      {title}
                    </div>
                  ))}
              </div>
            </div>



            {/* Interests Word Cloud */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-semibold mb-4">Interests</h2>
              <div id="interests-cloud"></div>
            </div>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-4 rounded-lg">
            Processing your data...
          </div>
        </div>
      )}
    </div>
  )
}

export default App
