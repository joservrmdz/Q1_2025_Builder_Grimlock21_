
Use Cases 

@startuml
actor User
actor Admin as "Admin or Oracle"


rectangle "Solana Program" {
User --> (Submit Prediction)
Admin --> (Create Match)
Admin --> (Update Match Result)
User --> (Claim Reward)
Admin--> (Fetch Match Data)
(Manage Vault Funds) <-- SolanaProgram
}
@enduml


@startuml
class MatchAccountPDA {
signer: Pubkey
match_id: string
team_1: string
team_2: string
actual_score: string
status: enum (Open, Closed)
timestamp: int
}

class PredictionAccountPDA {
signer: PubKey
match_id: string
predicted_score: string
reward_claimed: bool
submission_time: int
seeds: match_id, signer 
}

class RewardAccountPDA {

seeds: match_id,
reward_amount: float
reward_status: enum (Pending, Claimed)
}

class VaultPDA {
signer: Pubkey
seeds: match_id, signer
total_funds: float
available_funds: float
}

class SolanaProgram {
+ create_match(admin_wallet, match_id, team_1, team_2, timestamp)
+ submit_prediction(user_wallet, match_id, predicted_score)
+ update_match_result(admin_wallet, match_id, actual_score)
+ claim_reward(user_wallet, match_id)
+ validate_prediction(user_wallet, match_id)
+ distribute_rewards()
+ manage_vault_funds()
+ fetch_match_data(oracle, match_id)
}

SolanaProgram --> MatchAccountPDA : Stores match data
SolanaProgram --> PredictionAccountPDA : Stores user predictions
SolanaProgram --> RewardAccountPDA : Handles reward claims
SolanaProgram --> VaultPDA : Manages prize funds
SolanaProgram --> MatchAccountPDA : Fetches match data
@enduml


@startuml
actor Admin
participant "Next.js Frontend" as Frontend
participant "Solana Program" as Program
participant "Match Account (PDA)" as Storage

Admin -> Frontend: Enter Match Details
Frontend -> Program: Send Match Data
Program -> Storage: Store Match
@enduml

@startuml
actor User
participant "Next.js Frontend" as Frontend
participant "Solana Program" as Program
participant "Prediction Account (PDA)" as Storage
participant "Vault PDA" as Vault

User -> Frontend: Enter Prediction
Frontend -> Program: Send Prediction Data
Program -> Storage: Store Prediction
Program -> Vault: Reserve Entry Fee
@enduml

@startuml
actor Admin
participant "Solana Program" as Program
participant "Match Account (PDA)" as Storage

Admin -> Program: Submit Match Result
Program -> Storage: Update Match Data
@enduml

@startuml
actor User
participant "Solana Program" as Program
participant "Reward Account (PDA)" as Storage
participant "Vault PDA" as Vault

User -> Program: Request Reward
Program -> Storage: Validate Prediction
Program -> Vault: Transfer Reward
Program -> User: Distribute Reward
@enduml

@startuml
actor Oracle
participant "Solana Program" as Program
participant "Match Account (PDA)" as Storage

Oracle -> Program: Fetch Match Data
Program -> Storage: Store Match Data
@enduml

