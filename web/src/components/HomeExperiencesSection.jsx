import Typewriter from './Typewriter';
import { PROPERTY_EXPERIENCES } from '../data/propertyExperiences';
import { experiencesPath } from '../utils/paths';
import AdSlot from './AdSlot';

const PREVIEW = PROPERTY_EXPERIENCES.slice(0, 4);

export default function HomeExperiencesSection() {
  return (
    <section className="home-exp-section section-bg-cream" id="home-experiences">
      <div className="container">
        <header className="home-exp-intro" data-reveal="up">
          <div className="eyebrow eyebrow--underline" style={{ color: '#101e2c' }}>
            Experiences
          </div>
          <h2 className="why-big-text">
            Festivals, circles &amp;
            <br />
            <span className="why-script-line stays-script">
              <em className="typewriter-cursor">
                <Typewriter text="gatherings in the hills" className="" style={{ fontStyle: 'normal' }} />
              </em>
            </span>
          </h2>
          <p className="home-exp-sub">
            Holi, Diwali, wellness circles and folk evenings — moments that turn a stay into a story.
          </p>
        </header>

        <div className="home-exp-grid" data-reveal="up" data-delay="2">
          {PREVIEW.map((exp) => (
            <a key={exp.id} href={experiencesPath()} className="home-exp-card">
              <div className="home-exp-card-img" style={{ backgroundImage: `url('${exp.img}')` }} />
              <div className="home-exp-card-body">
                <span className="home-exp-card-tag">{exp.tag}</span>
                <h3>{exp.emoji} {exp.title}</h3>
                <p>{exp.desc}</p>
              </div>
            </a>
          ))}
        </div>

        <div className="home-exp-foot" data-reveal="up">
          <a href={experiencesPath()} className="btn btn-ghost" style={{ fontSize: '.85rem' }}>
            Browse all experiences <span className="btn-arrow">→</span>
          </a>
        </div>
      </div>
      <AdSlot adId="home-ad1" />
    </section>
  );
}
