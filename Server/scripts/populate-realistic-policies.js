import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Comprehensive, realistic policies for each department
const departmentPolicies = {
  'Water Supply Department': `# Water Supply Department - Policies and Guidelines

## Overview
The Water Supply Department is responsible for ensuring continuous, safe, and adequate water supply to all citizens within the municipal jurisdiction. This document outlines the operational policies, service standards, and regulatory guidelines governing water supply services.

## Core Responsibilities

### Water Distribution
- Maintain 24x7 water supply to all connected households
- Ensure water quality meets IS 10500:2012 standards
- Monitor and maintain optimal water pressure (15-30 PSI)
- Regular testing of water samples at certified laboratories

### Infrastructure Management
- Maintain and upgrade water distribution network
- Install and maintain water meters for all connections
- Conduct regular pipeline inspections and leak detection
- Emergency repair response within 4 hours

## Service Delivery Standards

### New Connection Processing
- Application acknowledgment: Within 24 hours
- Site inspection: Within 3 working days
- Connection approval: Within 15 working days
- Physical connection: Within 7 days of approval

### Billing and Payment
- Monthly billing cycle with 15-day payment window
- Online payment facility available 24x7
- Grace period of 7 days before late fee application
- Disconnection notice: 15 days before action

### Quality Assurance
- Daily chlorine residual testing at distribution points
- Weekly bacteriological testing
- Monthly comprehensive water quality analysis
- Quarterly third-party audit of water quality

## Operational Guidelines

### Water Conservation
- Promote rainwater harvesting in new constructions
- Implement water audit programs
- Public awareness campaigns on water conservation
- Penalty for water wastage and unauthorized connections

### Emergency Response
- 24x7 helpline for water supply complaints
- Emergency repair team on standby
- Tanker water supply during supply disruptions
- Priority restoration for hospitals and essential services

### Maintenance Schedule
- Pipeline flushing: Quarterly
- Overhead tank cleaning: Bi-annually
- Pump house maintenance: Monthly
- Valve and hydrant inspection: Quarterly

## Grievance Handling

### Response Timeline
- Emergency complaints (no water): 2 hours
- Quality complaints: 4 hours
- Billing disputes: 3 working days
- New connection queries: 1 working day

### Escalation Matrix
- Level 1: Ward Officer (0-24 hours)
- Level 2: Assistant Engineer (24-48 hours)
- Level 3: Executive Engineer (48-72 hours)
- Level 4: Department Head (72+ hours)

## Compliance and Monitoring

### Regulatory Compliance
- Adherence to Maharashtra Water Supply and Sewerage Act
- Compliance with Central Public Health and Environmental Engineering Organization (CPHEEO) guidelines
- Regular reporting to State Water Supply Department
- Annual audit by Comptroller and Auditor General

### Performance Indicators
- Water supply coverage: Target 100%
- Non-revenue water: Target <15%
- Customer satisfaction: Target >85%
- Complaint resolution: Target 95% within SLA

## Tariff Structure

### Domestic Connections
- 0-6000 liters: ₹5 per 1000 liters
- 6001-15000 liters: ₹8 per 1000 liters
- Above 15000 liters: ₹12 per 1000 liters

### Commercial Connections
- Flat rate: ₹15 per 1000 liters
- Minimum monthly charge: ₹500

### Industrial Connections
- Negotiated rates based on consumption
- Separate agreement required

## Contact Information

**Department Head:** Executive Engineer, Water Supply
**Emergency Helpline:** 1916
**Office Hours:** Monday-Saturday, 10:00 AM - 6:00 PM
**Email:** water.supply@municipal.gov.in

---

*Last Updated: ${new Date().toLocaleDateString('en-IN')}*
*Document Version: 2.1*
`,

  'Water Supply and Sanitation Department': `# Water Supply and Sanitation Department - Policies and Guidelines

## Overview
The Water Supply and Sanitation Department ensures integrated management of water supply, sewerage, and sanitation services, promoting public health and environmental sustainability.

## Water Supply Policies

### Service Standards
- Continuous water supply: 24x7 in urban areas
- Water quality: Compliance with IS 10500:2012
- Per capita supply: 135 LPCD (Liters Per Capita Per Day)
- Pressure maintenance: 15-30 PSI at consumer end

### Connection Management
- New connection processing: 15 working days
- Meter installation: Mandatory for all connections
- Leak detection and repair: Within 24 hours
- Customer service centers in each ward

## Sanitation and Sewerage Policies

### Sewerage Network
- Coverage target: 100% in urban areas
- Regular maintenance and cleaning of sewer lines
- CCTV inspection of critical sewer sections
- Emergency response for sewer blockages: 2 hours

### Wastewater Treatment
- All wastewater to be treated before discharge
- Compliance with CPCB effluent standards
- Regular monitoring of treatment plant performance
- Sludge management as per environmental norms

### Public Sanitation
- Public toilet maintenance: Daily cleaning
- Availability of water and soap in all facilities
- Disabled-friendly infrastructure
- Separate facilities for men and women

## Solid Waste Management Integration

### Coordination
- Joint planning with Solid Waste Management Department
- Integrated collection and disposal systems
- Awareness programs on waste segregation
- Monitoring of illegal waste dumping in drains

## Health and Safety

### Disease Prevention
- Regular vector control in drainage areas
- Monitoring of water-borne disease outbreaks
- Coordination with Health Department
- Public awareness on hygiene practices

### Worker Safety
- Personal protective equipment for all field staff
- Regular health checkups for sanitation workers
- Training on safe handling of sewage
- Insurance coverage for all workers

## Environmental Compliance

### Water Conservation
- Rainwater harvesting promotion
- Greywater recycling initiatives
- Leak detection and reduction programs
- Public awareness campaigns

### Pollution Control
- Zero discharge of untreated sewage
- Regular monitoring of water bodies
- Compliance with environmental clearances
- Quarterly environmental audits

## Grievance Redressal

### Response Timeline
- Water supply issues: 4 hours
- Sewerage blockages: 2 hours
- Quality complaints: 6 hours
- Billing disputes: 3 working days

### Complaint Channels
- 24x7 helpline: 1916
- Mobile app: Municipal Services
- Website: www.municipal.gov.in
- Walk-in: Ward offices

## Performance Monitoring

### Key Performance Indicators
- Water supply coverage: 100%
- Sewerage coverage: 95%
- Treatment plant efficiency: >90%
- Customer satisfaction: >85%
- Complaint resolution: 95% within SLA

## Tariff and Charges

### Water Supply Charges
- Domestic: ₹5-12 per 1000 liters (slab-based)
- Commercial: ₹15 per 1000 liters
- Industrial: Negotiated rates

### Sewerage Charges
- 60% of water supply charges
- Minimum monthly charge: ₹100

## Contact Information

**Department Head:** Executive Engineer, WSS
**Emergency Helpline:** 1916
**Email:** wss@municipal.gov.in

---

*Last Updated: ${new Date().toLocaleDateString('en-IN')}*
`,

  'Public Works Department': `# Public Works Department - Policies and Guidelines

## Overview
The Public Works Department (PWD) is responsible for planning, construction, and maintenance of public infrastructure including roads, bridges, buildings, and other civic amenities.

## Core Functions

### Infrastructure Development
- Planning and execution of capital works
- Construction of roads, bridges, and flyovers
- Development of public buildings and facilities
- Urban infrastructure upgrades

### Maintenance Operations
- Regular maintenance of existing infrastructure
- Preventive maintenance programs
- Emergency repairs and restoration
- Asset management and lifecycle planning

## Construction Standards

### Quality Specifications
- Compliance with IS codes and IRC specifications
- Use of approved materials and technologies
- Third-party quality testing mandatory
- Adherence to approved drawings and designs

### Safety Requirements
- Safety audit before project commencement
- Personal protective equipment for all workers
- Traffic management during construction
- Public safety measures at construction sites

## Project Management

### Planning and Approval
- Detailed Project Report (DPR) preparation
- Technical and financial approval process
- Environmental and social impact assessment
- Public consultation for major projects

### Execution Timeline
- Minor works (<₹10 lakhs): 3 months
- Medium works (₹10-50 lakhs): 6 months
- Major works (>₹50 lakhs): As per DPR
- Emergency works: Immediate action

### Quality Control
- Daily site inspection by engineers
- Weekly progress review meetings
- Monthly quality audit
- Final inspection before handover

## Road Maintenance

### Maintenance Categories
- Routine maintenance: Monthly
- Periodic maintenance: Annual
- Special repairs: As needed
- Emergency repairs: Within 24 hours

### Standards
- Pothole filling: Within 48 hours of complaint
- Road resurfacing: Based on condition survey
- Drainage maintenance: Before monsoon
- Street furniture maintenance: Quarterly

## Building Construction

### Public Buildings
- Compliance with National Building Code
- Energy-efficient design mandatory
- Accessibility for persons with disabilities
- Green building certification for new constructions

### Maintenance
- Annual structural audit
- Preventive maintenance schedule
- Emergency repair protocol
- Renovation and upgradation as needed

## Contractor Management

### Empanelment
- Technical and financial capability assessment
- Past performance evaluation
- Registration and licensing verification
- Annual renewal of empanelment

### Work Allocation
- Transparent tendering process
- E-procurement for all works
- Performance-based contractor rating
- Blacklisting for non-performance

## Financial Management

### Budget Allocation
- Annual budget preparation
- Quarterly budget review
- Utilization monitoring
- Audit compliance

### Payment Process
- Running bill payment: Within 15 days
- Final bill payment: Within 30 days
- Retention money: As per contract
- Performance security: 5-10% of contract value

## Grievance Handling

### Public Complaints
- Road damage: 48 hours response
- Building maintenance: 7 days response
- New work requests: 15 days assessment
- Quality issues: Immediate investigation

### Escalation
- Level 1: Assistant Engineer (0-3 days)
- Level 2: Executive Engineer (3-7 days)
- Level 3: Superintending Engineer (7-15 days)
- Level 4: Chief Engineer (15+ days)

## Environmental Compliance

### Sustainable Practices
- Use of recycled materials where feasible
- Waste management at construction sites
- Dust and noise pollution control
- Tree plantation for compensatory afforestation

### Clearances
- Environmental clearance for major projects
- Consent to establish from pollution board
- Traffic impact assessment
- Heritage clearance where applicable

## Performance Monitoring

### Key Indicators
- Project completion rate: >90%
- Budget utilization: 95-100%
- Quality compliance: 100%
- Citizen satisfaction: >80%

## Contact Information

**Department Head:** Chief Engineer, PWD
**Helpline:** 1800-XXX-XXXX
**Email:** pwd@municipal.gov.in

---

*Last Updated: ${new Date().toLocaleDateString('en-IN')}*
`
};

// Add more departments with similar comprehensive policies
const additionalPolicies = {
  'Roads Department': `# Roads Department - Policies and Guidelines

## Overview
The Roads Department is dedicated to the construction, maintenance, and management of the municipal road network, ensuring safe and efficient transportation infrastructure for all citizens.

## Road Construction Standards

### Design Specifications
- Compliance with IRC (Indian Roads Congress) standards
- Minimum road width: As per development plan
- Proper drainage system integration
- Pedestrian and cyclist-friendly design

### Material Specifications
- Bitumen: Grade VG-30 or as specified
- Aggregate: Crushed stone meeting IS standards
- Concrete: M-30 grade for rigid pavements
- Quality testing at approved laboratories

## Maintenance Program

### Routine Maintenance
- Daily inspection of major roads
- Weekly inspection of internal roads
- Pothole filling within 48 hours
- Road marking renewal: Annual

### Periodic Maintenance
- Resurfacing based on condition survey
- Crack sealing and patching
- Drainage cleaning before monsoon
- Traffic sign maintenance

### Emergency Repairs
- Response time: Within 2 hours
- Temporary repairs: Within 24 hours
- Permanent repairs: Within 7 days
- 24x7 emergency helpline operational

## Traffic Management

### Road Safety
- Speed breakers at designated locations
- Proper signage and road markings
- Street lighting on all major roads
- Pedestrian crossings at regular intervals

### Parking Management
- Designated parking zones
- No-parking enforcement
- Parking fee collection
- Towing of illegally parked vehicles

## Grievance Handling

### Response Timeline
- Pothole complaints: 48 hours
- Road damage: 72 hours
- Drainage issues: 24 hours
- Street light issues: 24 hours

## Contact Information

**Department Head:** Executive Engineer, Roads
**Helpline:** 1800-XXX-ROADS
**Email:** roads@municipal.gov.in

---

*Last Updated: ${new Date().toLocaleDateString('en-IN')}*
`,

  'Garbage Management': `# Garbage Management - Policies and Guidelines

## Overview
The Garbage Management Department ensures efficient collection, transportation, processing, and disposal of solid waste in compliance with Solid Waste Management Rules, 2016.

## Waste Collection

### Door-to-Door Collection
- Daily collection from all households
- Separate collection of wet and dry waste
- Collection timings: 6:00 AM - 10:00 AM
- Missed collection complaints: 24-hour response

### Segregation at Source
- Mandatory waste segregation by citizens
- Three-bin system: Wet, Dry, Hazardous
- Penalties for non-compliance
- Awareness programs on segregation

## Waste Processing

### Composting
- Wet waste processing at composting plants
- Production of organic manure
- Distribution to farmers and gardeners
- Quality testing of compost

### Recycling
- Dry waste sorting and recycling
- Partnership with recycling agencies
- Revenue generation from recyclables
- Promotion of circular economy

### Disposal
- Sanitary landfill for non-recyclable waste
- Compliance with environmental norms
- Leachate treatment facility
- Regular monitoring of landfill operations

## Public Sanitation

### Street Cleaning
- Daily sweeping of all roads
- Mechanical sweeping of major roads
- Litter bin maintenance
- Anti-littering enforcement

### Public Toilets
- Daily cleaning and maintenance
- Water and soap availability
- Disabled-friendly facilities
- Attendant on duty during operating hours

## Grievance Handling

### Response Timeline
- Missed collection: 24 hours
- Overflowing bins: 12 hours
- Public toilet issues: 6 hours
- Illegal dumping: 48 hours

## Contact Information

**Department Head:** Superintendent, Garbage Management
**Helpline:** 1800-XXX-CLEAN
**Email:** garbage@municipal.gov.in

---

*Last Updated: ${new Date().toLocaleDateString('en-IN')}*
`,

  'Education Department': `# Education Department - Policies and Guidelines

## Overview
The Education Department oversees municipal schools, educational programs, and initiatives to ensure quality education for all children within the municipal jurisdiction.

## School Management

### Academic Standards
- Curriculum aligned with state board
- Regular teacher training programs
- Student assessment and evaluation
- Parent-teacher meetings: Quarterly

### Infrastructure
- Adequate classrooms and facilities
- Library and laboratory facilities
- Playground and sports equipment
- Disabled-friendly infrastructure

## Student Welfare

### Mid-Day Meal Program
- Nutritious meals for all students
- Quality and hygiene standards
- Regular health checkups
- Monitoring by school management committee

### Scholarships and Support
- Merit-based scholarships
- Financial assistance for needy students
- Free textbooks and uniforms
- Special support for differently-abled students

## Teacher Management

### Recruitment
- Transparent recruitment process
- Qualification verification
- Training and orientation
- Performance evaluation

### Professional Development
- Regular training programs
- Workshops and seminars
- Exposure visits
- Career advancement opportunities

## Grievance Handling

### Response Timeline
- Academic issues: 3 working days
- Infrastructure complaints: 7 working days
- Teacher-related issues: 5 working days
- Administrative matters: 10 working days

## Contact Information

**Department Head:** Education Officer
**Helpline:** 1800-XXX-EDU
**Email:** education@municipal.gov.in

---

*Last Updated: ${new Date().toLocaleDateString('en-IN')}*
`
};

// Merge all policies
Object.assign(departmentPolicies, additionalPolicies);

async function populateRealisticPolicies() {
  const client = await pool.connect();
  
  try {
    console.log('\n' + '='.repeat(80));
    console.log('POPULATING REALISTIC DEPARTMENT POLICIES');
    console.log('='.repeat(80) + '\n');

    // Get all departments
    const deptResult = await client.query(`
      SELECT id, name FROM departments ORDER BY name
    `);

    console.log(`Found ${deptResult.rows.length} departments\n`);

    let updated = 0;
    let skipped = 0;

    for (const dept of deptResult.rows) {
      const policy = departmentPolicies[dept.name];
      
      if (policy) {
        await client.query(`
          UPDATE departments
          SET policies = $1, updated_at = NOW()
          WHERE id = $2
        `, [policy, dept.id]);
        
        console.log(`✅ ${dept.name}: Updated (${policy.length} characters)`);
        updated++;
      } else {
        console.log(`⚠️  ${dept.name}: No policy template available`);
        skipped++;
      }
    }

    console.log('\n' + '='.repeat(80));
    console.log('SUMMARY');
    console.log('='.repeat(80));
    console.log(`✅ Updated: ${updated} departments`);
    console.log(`⚠️  Skipped: ${skipped} departments`);
    console.log('='.repeat(80) + '\n');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await pool.end();
  }
}

populateRealisticPolicies();
