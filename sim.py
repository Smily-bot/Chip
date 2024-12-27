import numpy as np
import matplotlib.pyplot as plt

# Define parameters
mass = 2.0  # Mass of the particle in kg
initial_position = np.array([-5, 0])  # Starting position (x0, y0) at -5
initial_velocity = np.array([7, -3])  # Initial velocity (vx0, vy0) in m/s
force = np.array([-4, 2])  # Constant force (Fx, Fy) in N
acceleration = force / mass  # Calculate acceleration (a = F/m)
time_intervals = np.arange(0, 6, 1)  # From 0 to 5 seconds

# Initialize lists to store positions, velocities, energies
positions = []
velocities = []
kinetic_energies = []
potential_energies = []
total_energies = []
accelerations = []

# Calculate position, velocity, and energy at each time interval
for t in time_intervals:
    # Update position using kinematics
    position = initial_position + initial_velocity * t + 0.5 * acceleration * t**2
    positions.append(position)

    # Update velocity using a = F/m
    velocity = initial_velocity + acceleration * t
    velocities.append(velocity)

    # Store the constant acceleration
    accelerations.append(acceleration)

    # Calculate kinetic and potential energy
    kinetic_energy = 0.5 * mass * np.linalg.norm(velocity) ** 2
    potential_energy = mass * 9.81 * position[1]  # Using g = 9.81 m/s² for potential energy
    total_energy = kinetic_energy + potential_energy
    kinetic_energies.append(kinetic_energy)
    potential_energies.append(potential_energy)
    total_energies.append(total_energy)

# Convert lists to numpy arrays for plotting
positions = np.array(positions)
velocities = np.array(velocities)
kinetic_energies = np.array(kinetic_energies)
potential_energies = np.array(potential_energies)
total_energies = np.array(total_energies)

# Create the first plot for position and velocity
plt.figure(figsize=(14, 8))

# Position plot (x and y)
plt.subplot(2, 2, 1)
plt.plot(positions[:, 0], positions[:, 1], label='Path of the Particle', color='b')
plt.quiver(initial_position[0], initial_position[1], 
           initial_velocity[0], initial_velocity[1], 
           angles='xy', scale_units='xy', scale=1, color='g', 
           label='Initial Velocity', lw=2)
plt.quiver(initial_position[0], initial_position[1], 
           force[0], force[1], 
           angles='xy', scale_units='xy', scale=1, color='orange', 
           label='Force Vector', lw=2)

plt.title('Position of the Particle Over Time')
plt.xlabel('X Position (m)')
plt.ylabel('Y Position (m)')
plt.xlim(-10, 5)
plt.ylim(-10, 5)
plt.grid(True)
plt.legend()

# Create the second plot for velocity
plt.subplot(2, 2, 2)
plt.plot(time_intervals, np.linalg.norm(velocities, axis=1), label='Velocity (m/s)', color='g', marker='o')
plt.bar(time_intervals, np.linalg.norm(accelerations, axis=1), width=0.5, alpha=0.5, label='Acceleration (m/s²)', color='r')
plt.title('Velocity of the Particle Over Time')
plt.xlabel('Time (s)')
plt.ylabel('Velocity (m/s)')
plt.xticks(time_intervals)
plt.grid(True)
plt.legend()

# Create the third plot for energy
plt.subplot(2, 2, 3)
plt.plot(time_intervals, kinetic_energies, label='Kinetic Energy (J)', color='r')
plt.plot(time_intervals, potential_energies, label='Potential Energy (J)', color='b')
plt.plot(time_intervals, total_energies, label='Total Energy (J)', color='purple', linestyle='--')

plt.title('Energy of the Particle Over Time')
plt.xlabel('Time (s)')
plt.ylabel('Energy (J)')
plt.xticks(time_intervals)
plt.grid(True)
plt.legend()

plt.tight_layout()
plt.show()
