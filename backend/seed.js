require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');

const User = require('./models/User');
const Department = require('./models/Department');
const Employee = require('./models/Employee');
const Attendance = require('./models/Attendance');
const Leave = require('./models/Leave');
const Payroll = require('./models/Payroll');
const Performance = require('./models/Performance');

const seed = async () => {
  try {
    await connectDB();

    console.log('🌱 Starting seed...');

    // CLEAR DATABASE
    await Promise.all([
      User.deleteMany(),
      Department.deleteMany(),
      Employee.deleteMany(),
      Attendance.deleteMany(),
      Leave.deleteMany(),
      Payroll.deleteMany(),
      Performance.deleteMany()
    ]);

    console.log('🗑️ Cleared existing data');

    // CREATE DEPARTMENTS
    const depts = await Department.insertMany([
      {
        name: 'IT',
        description: 'Software development, infrastructure, and technical support',
        budget: 500000,
        status: 'Active'
      },
      {
        name: 'Finance',
        description: 'Financial planning, accounting, and budget management',
        budget: 300000,
        status: 'Active'
      },
      {
        name: 'Human Resource',
        description: 'Talent acquisition, employee relations, and HR operations',
        budget: 200000,
        status: 'Active'
      },
      {
        name: 'Marketing',
        description: 'Brand management, digital marketing, and customer engagement',
        budget: 400000,
        status: 'Active'
      },
      {
        name: 'Sales',
        description: 'Sales operations, business development, and client relations',
        budget: 350000,
        status: 'Active'
      },
      {
        name: 'Operations',
        description: 'Day-to-day operations, logistics, and process management',
        budget: 250000,
        status: 'Active'
      }
    ]);

    console.log(`✅ Created ${depts.length} departments`);

    // DEPARTMENT MAP
    const deptMap = {};
    depts.forEach((dept) => {
      deptMap[dept.name] = dept._id;
    });

    // CREATE ADMIN USER FIRST
    const adminUser = await User.create({
      fullName: 'System Administrator',
      email: 'admin@hrms.com',
      password: 'Admin@123',
      role: 'admin'
    });

    // CREATE ADMIN EMPLOYEE RECORD (now user exists)
    const adminEmployee = await Employee.create({
      user: adminUser._id, // Link to admin user
      fullName: 'System Administrator',
      gender: 'Male',
      dateOfBirth: new Date('1985-01-01'),
      email: 'admin@hrms.com',
      phoneNumber: '+1-555-0100',
      address: {
        street: '100 Admin Street',
        city: 'New York',
        state: 'NY',
        zipCode: '10001',
        country: 'USA'
      },
      position: 'System Administrator',
      department: deptMap['IT'],
      salary: 10000,
      joiningDate: new Date('2019-01-01'),
      status: 'Active'
    });

    // Update department with admin employee
    await Department.findByIdAndUpdate(deptMap['IT'], {
      $push: { employees: adminEmployee._id }
    });

    console.log('✅ Admin user created');

    // CREATE HR MANAGER USER FIRST
    const hrUser = await User.create({
      fullName: 'Sarah Johnson',
      email: 'hr@hrms.com',
      password: 'Admin@123',
      role: 'hr_manager'
    });

    // CREATE HR EMPLOYEE (now user exists)
    const hrEmployee = await Employee.create({
      user: hrUser._id, // Link to HR user
      fullName: 'Sarah Johnson',
      gender: 'Female',
      dateOfBirth: new Date('1988-03-15'),
      email: 'hr@hrms.com',
      phoneNumber: '+1-555-0102',
      address: {
        street: '456 HR Avenue',
        city: 'Chicago',
        state: 'IL',
        zipCode: '60601',
        country: 'USA'
      },
      position: 'HR Manager',
      department: deptMap['Human Resource'],
      salary: 7500,
      joiningDate: new Date('2020-01-10'),
      status: 'Active'
    });

    // Update department with HR employee
    await Department.findByIdAndUpdate(deptMap['Human Resource'], {
      $push: { employees: hrEmployee._id }
    });

    console.log('✅ HR Manager created');

    // SAMPLE EMPLOYEES DATA
    const sampleEmployeesData = [
      {
        fullName: 'James Wilson',
        gender: 'Male',
        dateOfBirth: new Date('1990-06-20'),
        email: 'james.wilson@hrms.com',
        phoneNumber: '+1-555-0103',
        position: 'Financial Analyst',
        department: deptMap['Finance'],
        salary: 6000,
        address: {
          street: '789 Finance Blvd',
          city: 'Boston',
          state: 'MA',
          zipCode: '02101',
          country: 'USA'
        }
      },
      {
        fullName: 'Emily Chen',
        gender: 'Female',
        dateOfBirth: new Date('1993-11-05'),
        email: 'emily.chen@hrms.com',
        phoneNumber: '+1-555-0104',
        position: 'Senior Software Engineer',
        department: deptMap['IT'],
        salary: 8500,
        address: {
          street: '321 Tech Lane',
          city: 'San Francisco',
          state: 'CA',
          zipCode: '94105',
          country: 'USA'
        }
      },
      {
        fullName: 'Michael Brown',
        gender: 'Male',
        dateOfBirth: new Date('1985-02-14'),
        email: 'michael.brown@hrms.com',
        phoneNumber: '+1-555-0105',
        position: 'Marketing Manager',
        department: deptMap['Marketing'],
        salary: 7200,
        address: {
          street: '567 Market Street',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001',
          country: 'USA'
        }
      },
      {
        fullName: 'Aisha Patel',
        gender: 'Female',
        dateOfBirth: new Date('1995-08-30'),
        email: 'aisha.patel@hrms.com',
        phoneNumber: '+1-555-0106',
        position: 'Frontend Developer',
        department: deptMap['IT'],
        salary: 7200,
        address: {
          street: '890 Code Avenue',
          city: 'Seattle',
          state: 'WA',
          zipCode: '98101',
          country: 'USA'
        }
      },
      {
        fullName: 'Robert Davis',
        gender: 'Male',
        dateOfBirth: new Date('1987-04-22'),
        email: 'robert.davis@hrms.com',
        phoneNumber: '+1-555-0107',
        position: 'Senior Accountant',
        department: deptMap['Finance'],
        salary: 5800,
        address: {
          street: '234 Accounting Road',
          city: 'Houston',
          state: 'TX',
          zipCode: '77001',
          country: 'USA'
        }
      },
      {
        fullName: 'Linda Martinez',
        gender: 'Female',
        dateOfBirth: new Date('1991-12-18'),
        email: 'linda.martinez@hrms.com',
        phoneNumber: '+1-555-0108',
        position: 'Marketing Specialist',
        department: deptMap['Marketing'],
        salary: 5000,
        address: {
          street: '678 Creative Drive',
          city: 'Miami',
          state: 'FL',
          zipCode: '33101',
          country: 'USA'
        }
      },
      {
        fullName: 'David Thompson',
        gender: 'Male',
        dateOfBirth: new Date('1984-09-10'),
        email: 'david.thompson@hrms.com',
        phoneNumber: '+1-555-0109',
        position: 'Systems Administrator',
        department: deptMap['IT'],
        salary: 6500,
        address: {
          street: '456 Server Street',
          city: 'Denver',
          state: 'CO',
          zipCode: '80201',
          country: 'USA'
        }
      },
      {
        fullName: 'Grace Kim',
        gender: 'Female',
        dateOfBirth: new Date('1996-03-25'),
        email: 'grace.kim@hrms.com',
        phoneNumber: '+1-555-0110',
        position: 'HR Coordinator',
        department: deptMap['Human Resource'],
        salary: 4800,
        address: {
          street: '123 HR Street',
          city: 'Portland',
          state: 'OR',
          zipCode: '97201',
          country: 'USA'
        }
      },
      {
        fullName: "Kevin O'Brien",
        gender: 'Male',
        dateOfBirth: new Date('1989-07-08'),
        email: 'kevin.obrien@hrms.com',
        phoneNumber: '+1-555-0111',
        position: 'Sales Executive',
        department: deptMap['Sales'],
        salary: 5500,
        address: {
          street: '890 Sales Avenue',
          city: 'Phoenix',
          state: 'AZ',
          zipCode: '85001',
          country: 'USA'
        }
      },
      {
        fullName: 'Priya Sharma',
        gender: 'Female',
        dateOfBirth: new Date('1992-01-30'),
        email: 'priya.sharma@hrms.com',
        phoneNumber: '+1-555-0112',
        position: 'Backend Developer',
        department: deptMap['IT'],
        salary: 7800,
        address: {
          street: '567 API Road',
          city: 'Austin',
          state: 'TX',
          zipCode: '73301',
          country: 'USA'
        }
      },
      {
        fullName: 'Carlos Rodriguez',
        gender: 'Male',
        dateOfBirth: new Date('1988-11-12'),
        email: 'carlos.rodriguez@hrms.com',
        phoneNumber: '+1-555-0113',
        position: 'Operations Manager',
        department: deptMap['Operations'],
        salary: 6200,
        address: {
          street: '345 Operations Way',
          city: 'Dallas',
          state: 'TX',
          zipCode: '75201',
          country: 'USA'
        }
      },
      {
        fullName: 'Jennifer White',
        gender: 'Female',
        dateOfBirth: new Date('1994-05-17'),
        email: 'jennifer.white@hrms.com',
        phoneNumber: '+1-555-0114',
        position: 'Business Analyst',
        department: deptMap['Finance'],
        salary: 5600,
        address: {
          street: '789 Analytics Blvd',
          city: 'Atlanta',
          state: 'GA',
          zipCode: '30301',
          country: 'USA'
        }
      }
    ];

    // CREATE SAMPLE EMPLOYEES WITH USER ACCOUNTS
    const createdEmployees = [];

    for (const empData of sampleEmployeesData) {
      // Create user account FIRST
      const user = await User.create({
        fullName: empData.fullName,
        email: empData.email,
        password: 'Password@123',
        role: 'employee'
      });

      // Create employee WITH user reference
      const employee = await Employee.create({
        user: user._id, // Now user exists before employee creation
        fullName: empData.fullName,
        gender: empData.gender,
        dateOfBirth: empData.dateOfBirth,
        email: empData.email,
        phoneNumber: empData.phoneNumber,
        address: empData.address,
        position: empData.position,
        department: empData.department,
        salary: empData.salary,
        joiningDate: new Date(2021 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 12), 1),
        status: 'Active'
      });

      // Update department with employee
      await Department.findByIdAndUpdate(empData.department, {
        $push: { employees: employee._id }
      });

      createdEmployees.push(employee);
      console.log(`  ✓ Created employee: ${empData.fullName}`);
    }

    console.log(`✅ Created ${sampleEmployeesData.length} sample employees`);

    // CREATE SAMPLE ATTENDANCE RECORDS
    const allEmployees = [adminEmployee, hrEmployee, ...createdEmployees];
    const attendanceRecords = [];

    console.log('📊 Generating attendance records...');

    for (const employee of allEmployees) {
      // Generate attendance for last 30 days
      for (let i = 0; i < 30; i++) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);

        // Skip weekends
        if (date.getDay() === 0 || date.getDay() === 6) continue;

        const checkInTime = new Date(date);
        checkInTime.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60));

        const checkOutTime = new Date(date);
        checkOutTime.setHours(16 + Math.floor(Math.random() * 3), Math.floor(Math.random() * 60));

        const isLate = checkInTime.getHours() > 9 || (checkInTime.getHours() === 9 && checkInTime.getMinutes() > 0);

        const workStartTime = new Date(date);
        workStartTime.setHours(9, 0, 0, 0);

        let lateMinutes = 0;
        if (isLate) {
          lateMinutes = Math.floor((checkInTime - workStartTime) / 60000);
        }

        // Calculate overtime
        const workEndTime = new Date(date);
        workEndTime.setHours(17, 0, 0, 0);

        let overtimeHours = 0;
        if (checkOutTime > workEndTime) {
          overtimeHours = Math.round(((checkOutTime - workEndTime) / (1000 * 60 * 60)) * 100) / 100;
        }

        attendanceRecords.push({
          employee: employee._id,
          date: date,
          checkIn: {
            time: checkInTime,
            location: 'Office',
            method: Math.random() > 0.5 ? 'Biometric' : 'Mobile'
          },
          checkOut: {
            time: checkOutTime,
            location: 'Office'
          },
          status: isLate ? 'Late' : 'Present',
          isLate: isLate,
          lateMinutes: lateMinutes,
          overtime: {
            hours: overtimeHours,
            approved: overtimeHours > 0,
          }
        });
      }
    }

    if (attendanceRecords.length > 0) {
      await Attendance.insertMany(attendanceRecords);
      console.log(`✅ Created ${attendanceRecords.length} attendance records`);
    }

    // CREATE SAMPLE LEAVE REQUESTS
    console.log('📅 Creating leave requests...');

    const leaveRequests = [
      {
        employee: createdEmployees[0]._id,
        leaveType: 'Annual',
        startDate: new Date('2024-06-15'),
        endDate: new Date('2024-06-20'),
        totalDays: 6,
        reason: 'Family vacation',
        status: 'Approved',
        approvedBy: hrUser._id,
        approvalDate: new Date('2024-06-10')
      },
      {
        employee: createdEmployees[1]._id,
        leaveType: 'Sick',
        startDate: new Date('2024-07-01'),
        endDate: new Date('2024-07-02'),
        totalDays: 2,
        reason: 'Flu and fever',
        status: 'Approved',
        approvedBy: hrUser._id,
        approvalDate: new Date('2024-07-01')
      },
      {
        employee: createdEmployees[3]._id,
        leaveType: 'Emergency',
        startDate: new Date('2024-07-10'),
        endDate: new Date('2024-07-12'),
        totalDays: 3,
        reason: 'Family emergency',
        status: 'Approved',
        approvedBy: hrUser._id,
        approvalDate: new Date('2024-07-09')
      },
      {
        employee: createdEmployees[5]._id,
        leaveType: 'Annual',
        startDate: new Date('2024-08-05'),
        endDate: new Date('2024-08-10'),
        totalDays: 6,
        reason: 'Personal travel',
        status: 'Pending'
      },
      {
        employee: createdEmployees[7]._id,
        leaveType: 'Sick',
        startDate: new Date('2024-08-15'),
        endDate: new Date('2024-08-16'),
        totalDays: 2,
        reason: 'Medical appointment',
        status: 'Pending'
      },
      {
        employee: createdEmployees[2]._id,
        leaveType: 'Maternity',
        startDate: new Date('2024-09-01'),
        endDate: new Date('2024-12-01'),
        totalDays: 90,
        reason: 'Maternity leave',
        status: 'Approved',
        approvedBy: hrUser._id,
        approvalDate: new Date('2024-08-15')
      }
    ];

    if (leaveRequests.length > 0) {
      await Leave.insertMany(leaveRequests);
      console.log(`✅ Created ${leaveRequests.length} leave requests`);
    }

    // CREATE SAMPLE PAYROLL RECORDS
    console.log('💰 Generating payroll records...');

    const payrollRecords = [];
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    for (const employee of allEmployees) {
      // Generate payroll for last 3 months
      for (let i = 0; i < 3; i++) {
        let month = currentMonth - i;
        let year = currentYear;

        if (month <= 0) {
          month += 12;
          year -= 1;
        }

        const basicSalary = employee.salary || 5000;
        const allowances = {
          housing: basicSalary * 0.1,
          transport: basicSalary * 0.05,
          medical: basicSalary * 0.05,
          other: 0
        };

        const totalAllowances = Object.values(allowances).reduce((a, b) => a + b, 0);

        const deductions = {
          tax: basicSalary * 0.15,
          insurance: basicSalary * 0.03,
          loan: 0,
          other: 0
        };

        const totalDeductions = Object.values(deductions).reduce((a, b) => a + b, 0);

        const overtimeAmount = Math.random() > 0.5 ? (basicSalary / 160) * 1.5 * (Math.floor(Math.random() * 10) + 1) : 0;
        const bonus = Math.random() > 0.7 ? Math.floor(Math.random() * 1000) + 500 : 0;

        const grossSalary = basicSalary + totalAllowances + overtimeAmount + bonus;
        const netSalary = grossSalary - totalDeductions;

        payrollRecords.push({
          employee: employee._id,
          month,
          year,
          basicSalary,
          allowances,
          deductions,
          overtime: {
            hours: overtimeAmount > 0 ? Math.floor(Math.random() * 10) + 1 : 0,
            rate: (basicSalary / 160) * 1.5,
            amount: Math.round(overtimeAmount * 100) / 100
          },
          bonus,
          grossSalary: Math.round(grossSalary * 100) / 100,
          netSalary: Math.round(netSalary * 100) / 100,
          paymentStatus: i === 0 ? 'Pending' : 'Paid',
          paymentDate: i > 0 ? new Date(year, month - 1, 28) : null,
          paymentMethod: 'Bank Transfer',
          generatedBy: adminUser._id
        });
      }
    }

    if (payrollRecords.length > 0) {
      await Payroll.insertMany(payrollRecords);
      console.log(`✅ Created ${payrollRecords.length} payroll records`);
    }

    // CREATE SAMPLE PERFORMANCE REVIEWS
    console.log('📈 Creating performance reviews...');

    const performanceReviews = [];

    for (let i = 0; i < Math.min(5, createdEmployees.length); i++) {
      const employee = createdEmployees[i];

      const ratings = {
        productivity: Math.floor(Math.random() * 3) + 3, // 3-5
        quality: Math.floor(Math.random() * 3) + 3,
        attendance: Math.floor(Math.random() * 3) + 3,
        teamwork: Math.floor(Math.random() * 3) + 3,
        communication: Math.floor(Math.random() * 3) + 3
      };

      const overallRating = Math.round((Object.values(ratings).reduce((a, b) => a + b, 0) / 5) * 10) / 10;

      performanceReviews.push({
        employee: employee._id,
        reviewer: hrUser._id,
        reviewPeriod: {
          startDate: new Date('2024-01-01'),
          endDate: new Date('2024-06-30')
        },
        ratings,
        overallRating,
        strengths: ['Strong technical skills', 'Good team player', 'Meets deadlines'],
        improvements: ['Could improve communication', 'Take more initiative'],
        goals: [
          {
            description: 'Complete advanced certification',
            targetDate: new Date('2024-12-31'),
            status: 'In Progress'
          },
          {
            description: 'Lead a team project',
            targetDate: new Date('2024-09-30'),
            status: 'Not Started'
          }
        ],
        comments: 'Overall good performance. Shows dedication and commitment to work.',
        status: i === 0 ? 'Completed' : Math.random() > 0.5 ? 'Completed' : 'Draft'
      });
    }

    if (performanceReviews.length > 0) {
      await Performance.insertMany(performanceReviews);
      console.log(`✅ Created ${performanceReviews.length} performance reviews`);
    }

    console.log('\n🎉 Seed completed successfully!\n');

    console.log('═══════════════════════════════════════════');
    console.log('           LOGIN CREDENTIALS              ');
    console.log('═══════════════════════════════════════════');
    console.log('Admin Login:');
    console.log('  Email: admin@hrms.com');
    console.log('  Password: Admin@123');
    console.log('  Role: Full system access');
    console.log('');
    console.log('HR Manager Login:');
    console.log('  Email: hr@hrms.com');
    console.log('  Password: Admin@123');
    console.log('  Role: HR management');
    console.log('');
    console.log('Employee Login Examples:');
    console.log('  Email: james.wilson@hrms.com');
    console.log('  Password: Password@123');
    console.log('');
    console.log('  Email: emily.chen@hrms.com');
    console.log('  Password: Password@123');
    console.log('');
    console.log('  Email: aisha.patel@hrms.com');
    console.log('  Password: Password@123');
    console.log('═══════════════════════════════════════════');
    console.log('');
    console.log('Summary:');
    console.log(`  ✓ ${depts.length} Departments`);
    console.log(`  ✓ 2 Admin/HR Users`);
    console.log(`  ✓ ${sampleEmployeesData.length} Employees`);
    console.log(`  ✓ ${attendanceRecords.length} Attendance Records`);
    console.log(`  ✓ ${leaveRequests.length} Leave Requests`);
    console.log(`  ✓ ${payrollRecords.length} Payroll Records`);
    console.log(`  ✓ ${performanceReviews.length} Performance Reviews`);
    console.log('');

    await mongoose.connection.close();
    process.exit(0);

  } catch (error) {
    console.error('❌ Seed failed:', error.message);
    if (error.errors) {
      Object.keys(error.errors).forEach(key => {
        console.error(`  - ${key}: ${error.errors[key].message}`);
      });
    }
    process.exit(1);
  }
};

// Run the seed function
seed();