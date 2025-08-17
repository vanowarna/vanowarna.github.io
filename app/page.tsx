import Image from 'next/image'
import StickyNav from '@/components/StickyNav'

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  mainEntity: {
    '@type': 'Person',
    name: 'Vanodhya Warnasooriya',
    headline: 'PhD Applicant — Vision, Generative & Interactive Computing',
    url: 'https://vanowarna.github.io/',
    image: '/vanodhya_2023.png',
    jobTitle: 'PhD Candidate',
    alumniOf: { '@type': 'CollegeOrUniversity', name: 'University of Peradeniya' },
    knowsAbout: [
      'Computer Vision','Generative Models','Computational Imaging','Human-Computer Interaction','AR/VR','Efficient On-Device ML','Embodied AI'
    ],
    sameAs: [
      'https://www.linkedin.com/in/vanowarna',
      'https://github.com/vanowarna',
      'https://www.facebook.com/vanowarnaLK',
      'https://www.instagram.com/vanowarna',
      'https://twitter.com/vanowarna',
      'http://www.youtube.com/c/vanowarna'
    ]
  }
}

export default function Page() {
  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 md:py-24">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="md:grid md:grid-cols-12 md:gap-12">
        {/* Left Column */}
        <header className="md:col-span-4 lg:col-span-3 md:sticky top-0 h-screen py-12 flex flex-col">
          <div>
            <div className="flex items-start mb-4">
              {/* Use /public image so static export works offline */}
              <Image src="/vanodhya_2023.png" alt="Vanodhya Warnasooriya" width={128} height={128} className="rounded-full border-2 border-gray-700 object-cover" />
            </div>
            <h1 className="text-3xl font-bold text-white">Vanodhya Warnasooriya</h1>
            <h2 className="mt-2 text-md font-medium text-blue-400">PhD Applicant — Vision, Generative & Interactive Computing</h2>
            <p className="mt-4 text-sm text-gray-400">Keywords: computer vision; multimodal/generative models; computational imaging; AR/VR; efficient on-device ML</p>
            <StickyNav />
          </div>

          <div className="flex flex-wrap gap-4 mt-8 text-gray-400">
            <a href="mailto:vanowarna@gmail.com" className="social-link" title="Email" aria-label="Email">✉️</a>
            <a href="https://www.linkedin.com/in/vanowarna" className="social-link" target="_blank" rel="noreferrer" title="LinkedIn">in</a>
            <a href="https://github.com/vanowarna" className="social-link" target="_blank" rel="noreferrer" title="GitHub">GH</a>
            <a href="https://scholar.google.com/citations?user=YOUR_ID_HERE" className="social-link" target="_blank" rel="noreferrer" title="Google Scholar">GS</a>
            <a href="https://twitter.com/vanowarna" className="social-link" target="_blank" rel="noreferrer" title="X">𝕏</a>
          </div>
        </header>

        {/* Right Column */}
        <main className="md:col-span-8 lg:col-span-9 space-y-20 pt-16 md:pt-12">
          {/* Profile */}
          <section id="profile" className="scroll-mt-24">
            <h3 className="section-heading">About Me</h3>
            <div className="glass-card p-6">
              <p className="text-lg leading-relaxed text-gray-300">
                Research and engineering efforts are focused on generative and interactive visual computing, uniting deep learning, computational imaging, and human-computer interaction. The work aims to create robust, real-time applications for human-AI collaboration and remote sensing, with a specialization in hardware-aware optimization for edge devices and bandwidth-constrained environments. Expertise is demonstrated through the development of systems for UAV-based disaster assessment, gaze-based semantic video communication, and efficient on-device facial analysis.
              </p>
            </div>
          </section>

          {/* Interests */}
          <section id="interests" className="scroll-mt-24">
            <h3 className="section-heading">Research Interests</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="interest-tag">Generative Models for Computational Imaging</div>
              <div className="interest-tag">Interactive Vision-Language Systems (AR/VR)</div>
              <div className="interest-tag">Efficient Multimodal AI for Edge Devices</div>
              <div className="interest-tag">3D Vision & Scene Understanding</div>
            </div>
          </section>

          {/* Publications */}
          <section id="publications" className="scroll-mt-24">
            <h3 className="section-heading">Publications & Preprints</h3>
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h4 className="text-xl font-bold text-white">Damage Assessment after Natural Disasters with UAVs</h4>
                <p className="text-sm text-gray-400 mt-1">M. M. Viduranga, N. S. Hewawiththi, <strong>V. G. Warnasooriya</strong>, T. Fernando, et al.</p>
                <p className="mt-2 text-gray-300"><em>Manuscript in preparation.</em></p>
                <a href="https://arxiv.org/pdf/2412.10756" target="_blank" className="inline-block mt-3 text-blue-400 hover:text-blue-300 font-semibold" rel="noreferrer">View on arXiv →</a>
              </div>
              <div className="glass-card p-6">
                <h4 className="text-xl font-bold text-white">Sum Rate Maximization in STAR-RIS Assisted Full-Duplex Communication Systems</h4>
                <p className="text-sm text-gray-400 mt-1">P. P. Perera, <strong>V. G. Warnasooriya</strong>, D. Kudathanthirige, H. A. Suraweera.</p>
                <p className="mt-2 text-gray-300"><em>IEEE International Conference on Communications (ICC)</em>, Seoul, South Korea, 2022.</p>
                <a href="https://ieeexplore.ieee.org/document/9838965" target="_blank" className="inline-block mt-3 text-blue-400 hover:text-blue-300 font-semibold" rel="noreferrer">View on IEEE Xplore →</a>
              </div>
            </div>
          </section>

          {/* Experience */}
          <section id="experience" className="scroll-mt-24">
            <h3 className="section-heading">Experience</h3>
            <div className="space-y-8">
              {/* Research */}
              <div className="glass-card p-6">
                <h4 className="text-xl font-bold text-white">Research Projects</h4>
                <div className="mt-4 border-l-2 border-blue-400 pl-4 space-y-6">
                  <div>
                    <p className="font-semibold text-gray-200">Semantic Feature Extraction for UAV-based Disaster Assessment (2024)</p>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-gray-300">
                      <li>Designed a task-agnostic semantic feature extractor for UAVs, achieving <strong>up to 92% reduction in transmitted data</strong>.</li>
                      <li>Profiled system for real-time monitoring, demonstrating <strong>~13x lower transmission latency</strong> and validating model feasibility (~70 GFLOPs) for onboard Jetson platforms.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-200">Attention-based Semantic Communication for Video Conferencing (2022-2023)</p>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-gray-300">
                      <li>Developed a non-wearable, gaze-based attention system, achieving <strong>~80% bandwidth savings</strong> through a novel semantic communication framework.</li>
                      <li>Implemented a GAN-based (GFPGAN) reconstruction module to ensure high visual quality (SSIM 0.81).</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Professional */}
              <div className="glass-card p-6">
                <h4 className="text-xl font-bold text-white">Professional Roles</h4>
                <div className="mt-4 border-l-2 border-blue-400 pl-4 space-y-6">
                  <div>
                    <p className="font-semibold text-gray-200">Electronic Engineer (R&D), Zone24x7 (Pvt.) Ltd.</p>
                    <p className="text-sm text-gray-400">Jul 2024 – Present</p>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-gray-300">
                      <li>Developing on-device computer vision modules (Apple AVFoundation) for real-time facial feature analysis.</li>
                      <li>Designing interactive, guidance-based user feedback systems (HCI) driven by computer vision outputs.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-200">Co-Founder & Lead Engineer, Resowave (Pvt.) Ltd.</p>
                    <p className="text-sm text-gray-400">Feb 2024 – Present</p>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-gray-300">
                      <li>Developing real-time visualization tools using Python and graphics libraries (e.g., OpenGL) for novel sensing technologies.</li>
                    </ul>
                  </div>
                  <div>
                    <p className="font-semibold text-gray-200">Electronic Engineer, Vega Innovations (Pvt.) Ltd.</p>
                    <p className="text-sm text-gray-400">Jan 2023 – Feb 2024</p>
                    <ul className="mt-2 list-disc list-inside space-y-1 text-gray-300">
                      <li>Designed a lightweight anti-spoofing algorithm for facial recognition using RGB, Depth, and IR data.</li>
                      <li>Engineered a LoRa-based smart farm sensor network with an LLM-based intelligent control system.</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Education */}
          <section id="education" className="scroll-mt-24">
            <h3 className="section-heading">Education</h3>
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h4 className="text-xl font-bold text-white">B.Sc. Eng. in Electrical & Electronic Engineering</h4>
                <p className="text-md text-gray-300">University of Peradeniya, Sri Lanka (2018 – 2023)</p>
                <ul className="mt-3 list-disc list-inside space-y-1 text-gray-300">
                  <li>Second Class Honours (Upper Division), GPA: 3.35/4.00</li>
                  <li>Secured rank of 141 among 32,075 candidates in GCE A-Level Physical Science stream (2017)</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Awards */}
          <section id="awards" className="scroll-mt-24">
            <h3 className="section-heading">Selected Awards & Achievements</h3>
            <div className="glass-card p-6">
              <ul className="list-disc list-inside space-y-3 text-gray-300">
                <li><b>First Place</b>, <a href="https://web2.ee.pdn.ac.lk/events/winners-undergrad-thesis-project-competition-2023" target="_blank" className="hover:text-blue-400 transition" rel="noreferrer">Undergraduate Thesis Project Competition, IEEE SPS</a> (2023)</li>
                <li><b>First Place</b>, <a href="https://ieeeyp.lk/insl/" target="_blank" className="hover:text-blue-400 transition" rel="noreferrer">IEEE Innovation Nation Sri Lanka (INSL)</a> Central Province (2023)</li>
                <li><b>Second Runners-Up</b>, <a href="https://slasscom.lk/publications/hackai-2021-2022-concludes-by-recognizing-school-and-university-student-winners/" target="_blank" className="hover:text-blue-400 transition" rel="noreferrer">Hack:AI Competition</a> (2022)</li>
                <li><b>Global Finalist</b>, <a href="https://www.eodashboardhackathon.org/challenges/air-quality/spatial-analysis-and-time-series/teams/watha/project" target="_blank" className="hover:text-blue-400 transition" rel="noreferrer">NASA EO Dashboard Hackathon</a> (2021)</li>
                <li><b>8th Place</b>, <a href="https://roverchallenge.org/" target="_blank" className="hover:text-blue-400 transition" rel="noreferrer">International Rover Design Challenge, Mars Society</a> (2021)</li>
              </ul>
            </div>
          </section>

          {/* Projects */}
          <section id="projects" className="scroll-mt-24">
            <h3 className="section-heading">Hands-on Projects</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="glass-card p-6">
                <h4 className="font-bold text-white">ICU Ventilator Development</h4>
                <p className="mt-2 text-gray-300">Contributed to the Human-Machine Interface (HMI) design and control system programming for a critical care ventilator.</p>
              </div>
              <div className="glass-card p-6">
                <h4 className="font-bold text-white">High-Altitude Balloon (HAB)</h4>
                <p className="mt-2 text-gray-300">Served as electronics lead and payload manager for the <a href="https://sedssl.org/operation-serendib/" target="_blank" className="hover:text-blue-400 transition" rel="noreferrer">Serendib 1.0/2.0</a> projects with SEDS Sri Lanka.</p>
              </div>
              <div className="glass-card p-6">
                <h4 className="font-bold text-white">Wireless Oximeter Design</h4>
                <p className="mt-2 text-gray-300">Designed a compact and efficient wireless oximeter, a project recognized under an IEEE COVID-19 grant.</p>
              </div>
              <div className="glass-card p-6">
                <h4 className="font-bold text-white">Crop Prediction Model</h4>
                <p className="mt-2 text-gray-300">Developed a supervised machine learning model to predict crop yields based on historical weather data.</p>
              </div>
            </div>
          </section>

          {/* Skills */}
          <section id="skills" className="scroll-mt-24">
            <h3 className="section-heading">Technical Skills</h3>
            <div className="glass-card p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h5 className="font-semibold text-white mb-2">Programming & ML</h5>
                  <p className="text-gray-300">Python, C++, C, MATLAB, PyTorch, TensorFlow, OpenCV, CUDA, TensorRT</p>
                </div>
                <div>
                  <h5 className="font-semibold text-white mb-2">Hardware & Platforms</h5>
                  <p className="text-gray-300">Jetson (Nano, Orin), Raspberry Pi, ESP32, STM32, Git, Docker, Conda</p>
                </div>
                <div>
                  <h5 className="font-semibold text-white mb-2">Design & Graphics</h5>
                  <p className="text-gray-300">KiCAD, Altium, SolidWorks, OpenGL (Basics), Adobe Creative Suite</p>
                </div>
                <div>
                  <h5 className="font-semibold text-white mb-2">Languages</h5>
                  <p className="text-gray-300">Sinhala (Native), English (Fluent)</p>
                </div>
              </div>
            </div>
          </section>

          {/* Leadership */}
          <section id="leadership" className="scroll-mt-24">
            <h3 className="section-heading">Leadership & Service</h3>
            <div className="space-y-6">
              <div className="glass-card p-6">
                <h4 className="text-xl font-bold text-white">Leadership Roles</h4>
                <ul className="mt-4 list-disc list-inside space-y-2 text-gray-300">
                  <li><b>Chairperson</b>, <a href="https://ieee.soc.pdn.ac.lk/" target="_blank" className="hover:text-blue-400 transition" rel="noreferrer">IEEE Student Branch, University of Peradeniya</a> (2022–2023)</li>
                  <li><b>Member, Advisory Board</b>, <a href="https://sedssl.org/" target="_blank" className="hover:text-blue-400 transition" rel="noreferrer">SEDS Sri Lanka</a> (2021–Present)</li>
                  <li><b>Mathematics Tutor and Student Mentor</b>, Sasnaka Sansada (2019-2021)</li>
                </ul>
              </div>
              <div className="glass-card p-6">
                <h4 className="text-xl font-bold text-white">Interests & Activities</h4>
                <ul className="mt-4 list-disc list-inside space-y-2 text-gray-300">
                  <li><b>Creative Production:</b> Producer of an upcoming TV series (Last Man) and Creative Producer for IEEE Sri Lanka Section Congress.</li>
                  <li><b>Aerial Cinematography:</b> Licensed drone pilot specializing in dynamic aerial footage.</li>
                  <li><b>Photography:</b> Active photographer with several national and international awards.</li>
                  <li><b>Amateur Radio:</b> General Class operator with call sign 4S6VNO.</li>
                </ul>
              </div>
            </div>
          </section>

          <footer className="text-center pt-12 pb-8">
            <p className="text-gray-500 text-sm">© {new Date().getFullYear()} Vanodhya Warnasooriya. Designed with a passion for clean code and clear communication.</p>
          </footer>
        </main>
      </div>
    </div>
  )
}
