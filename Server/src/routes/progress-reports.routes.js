/**
 * Progress Reports API Routes
 * 
 * Endpoints for fetching and displaying AI-generated progress tracking reports
 */

import express from 'express';
import { authenticateToken, authorizeRoles } from '../middleware/auth.middleware.js';
import progressTrackingScheduler from '../services/progress-tracking-scheduler.service.js';
import pool from '../config/database.js';

const router = express.Router();

/**
 * Get the latest progress report for the authenticated user's department
 */
router.get('/latest', authenticateToken, authorizeRoles(['department_head', 'department_officer']), async (req, res) => {
  try {
    const departmentId = req.user.department_id;

    if (!departmentId) {
      return res.status(400).json({
        success: false,
        message: 'User is not associated with any department'
      });
    }

    // Get department name
    const deptResult = await pool.query(
      'SELECT name FROM departments WHERE id = $1',
      [departmentId]
    );

    if (deptResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Department not found'
      });
    }

    const departmentName = deptResult.rows[0].name;

    // Fetch latest report from Azure Blob Storage
    const report = await progressTrackingScheduler.getLatestDepartmentReport(departmentName);

    if (!report) {
      return res.json({
        success: true,
        data: null,
        message: 'No reports available yet. Reports are generated every hour.'
      });
    }

    // Parse markdown content
    const parsedReport = parseMarkdownReport(report.content);

    res.json({
      success: true,
      data: {
        departmentName,
        fileName: report.fileName,
        lastModified: report.lastModified,
        size: report.size,
        content: report.content,
        parsed: parsedReport
      }
    });

  } catch (error) {
    console.error('Error fetching progress report:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch progress report',
      error: error.message
    });
  }
});

/**
 * Get scheduler status (admin only)
 */
router.get('/scheduler/status', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    const status = progressTrackingScheduler.getStatus();
    
    res.json({
      success: true,
      data: status
    });

  } catch (error) {
    console.error('Error fetching scheduler status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch scheduler status',
      error: error.message
    });
  }
});

/**
 * Trigger manual analysis (admin only)
 */
router.post('/scheduler/run', authenticateToken, authorizeRoles(['admin']), async (req, res) => {
  try {
    // Run analysis in background
    progressTrackingScheduler.runAnalysis().catch(error => {
      console.error('Background analysis error:', error);
    });

    res.json({
      success: true,
      message: 'Progress tracking analysis started in background'
    });

  } catch (error) {
    console.error('Error triggering analysis:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger analysis',
      error: error.message
    });
  }
});

/**
 * Parse markdown report into structured data
 */
function parseMarkdownReport(markdown) {
  const sections = [];
  const lines = markdown.split('\n');
  
  let currentSection = null;
  let currentContent = [];

  for (const line of lines) {
    // Check for headers
    if (line.startsWith('# ')) {
      // Main title
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        sections.push(currentSection);
      }
      currentSection = {
        type: 'title',
        level: 1,
        text: line.substring(2).trim(),
        content: ''
      };
      currentContent = [];
    } else if (line.startsWith('## ')) {
      // Section header
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        sections.push(currentSection);
      }
      currentSection = {
        type: 'section',
        level: 2,
        text: line.substring(3).trim(),
        content: ''
      };
      currentContent = [];
    } else if (line.startsWith('### ')) {
      // Subsection header
      if (currentSection) {
        currentSection.content = currentContent.join('\n').trim();
        sections.push(currentSection);
      }
      currentSection = {
        type: 'subsection',
        level: 3,
        text: line.substring(4).trim(),
        content: ''
      };
      currentContent = [];
    } else {
      // Content line
      currentContent.push(line);
    }
  }

  // Add last section
  if (currentSection) {
    currentSection.content = currentContent.join('\n').trim();
    sections.push(currentSection);
  }

  // Extract metadata
  const metadata = {};
  const metadataSection = sections.find(s => s.type === 'title');
  if (metadataSection && metadataSection.content) {
    const metaLines = metadataSection.content.split('\n');
    for (const line of metaLines) {
      if (line.includes('**Generated:**')) {
        metadata.generatedAt = line.split('**Generated:**')[1].trim();
      } else if (line.includes('**Department ID:**')) {
        metadata.departmentId = line.split('**Department ID:**')[1].trim();
      } else if (line.includes('**Report Type:**')) {
        metadata.reportType = line.split('**Report Type:**')[1].trim();
      }
    }
  }

  // Extract key metrics
  const metrics = {};
  const dataSummarySection = sections.find(s => s.text && s.text.includes('Data Summary'));
  if (dataSummarySection && dataSummarySection.content) {
    const metricLines = dataSummarySection.content.split('\n');
    for (const line of metricLines) {
      if (line.includes('**Total Grievances:**')) {
        metrics.totalGrievances = parseInt(line.split('**Total Grievances:**')[1].trim()) || 0;
      } else if (line.includes('**Resolution Rate:**')) {
        metrics.resolutionRate = parseFloat(line.split('**Resolution Rate:**')[1].replace('%', '').trim()) || 0;
      } else if (line.includes('**Performance Score:**')) {
        metrics.performanceScore = parseFloat(line.split('**Performance Score:**')[1].split('/')[0].trim()) || 0;
      } else if (line.includes('**Officer Utilization:**')) {
        metrics.officerUtilization = parseFloat(line.split('**Officer Utilization:**')[1].replace('%', '').trim()) || 0;
      } else if (line.includes('**Budget Utilization:**')) {
        metrics.budgetUtilization = parseFloat(line.split('**Budget Utilization:**')[1].replace('%', '').trim()) || 0;
      }
    }
  }

  return {
    metadata,
    metrics,
    sections: sections.filter(s => s.content && s.content.length > 0)
  };
}

export default router;
